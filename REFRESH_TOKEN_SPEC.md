# Refresh Token + Redis 구현 명세서

---

## 개요

현재 구조는 Access Token 만료 시 재로그인이 필요합니다.
Refresh Token을 도입해 자동으로 Access Token을 재발급합니다.

```
로그인
  → access_token  (만료: 15분)
  → refresh_token (만료: 7일)

access_token 만료
  → POST /auth/refresh 호출
  → refresh_token 유효하면 새 access_token 발급

refresh_token 만료
  → 재로그인 필요
```

---

## 구현 순서

---

### 1단계 — AppModule에 Redis 연결

`@nestjs-modules/ioredis`의 `RedisModule.forRoot()`를 `app.module.ts`의 `imports`에 등록합니다.

**설정값**
- `type`: `'single'`
- `url`: `'redis://localhost:6379'`

---

### 2단계 — auth.service.ts 수정

`InjectRedis()`로 Redis 인스턴스를 주입받습니다.

```
constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
  @InjectRedis() private redis: Redis,
)
```

**`login()` 수정**

기존에 access_token만 발급하던 것을 두 개로 변경합니다.

| 토큰 | 만료시간 | 저장 위치 |
|------|---------|---------|
| access_token | 15분 | 클라이언트 |
| refresh_token | 7일 | Redis + 클라이언트 |

Redis 저장 방법
```
key:   `refresh_token:${userId}`
value: refresh_token 문자열
EX:    60 * 60 * 24 * 7  (7일, 초 단위)
```

Redis 명령어: `this.redis.set(key, value, 'EX', seconds)`

반환값
```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

---

**`refresh()` 메서드 추가**

파라미터: `refreshToken: string`

1. `jwtService.verify(refreshToken)`으로 payload 꺼내기
2. Redis에서 `refresh_token:${userId}` 키로 저장된 토큰 조회
3. 전달받은 토큰과 Redis 토큰 일치 여부 확인
4. 일치하면 새 access_token 발급해서 반환
5. 불일치 또는 없으면 `UnauthorizedException`

Redis 조회 명령어: `this.redis.get(key)`

반환값
```json
{
  "access_token": "..."
}
```

---

**`logout()` 메서드 추가**

파라미터: `userId: number`

Redis에서 해당 유저의 refresh_token 삭제

Redis 삭제 명령어: `this.redis.del(key)`

반환값
```json
{
  "message": "로그아웃되었습니다."
}
```

---

### 3단계 — auth.controller.ts 수정

**`POST /auth/refresh`**

```
인증: 불필요
Body: { refresh_token: string }
반환: { access_token: string }
```

**`POST /auth/logout`**

```
인증: JwtAuthGuard 필요
Body: 없음
반환: { message: string }
```

`req.user.id`로 userId를 꺼내서 `authService.logout(userId)` 호출

---

## 프론트 연동 (이미 구현됨)

프론트 `api/axios.ts`의 interceptor에서 401 응답 시 `/auth/refresh`를 호출하도록 수정이 필요합니다.

현재는 401 시 바로 `/login`으로 리디렉트합니다.
Refresh Token 구현 후 interceptor를 아래 흐름으로 수정해야 합니다.

```
401 응답
  → localStorage에서 refresh_token 꺼내기
  → POST /auth/refresh 호출
  → 성공 → 새 access_token 저장 후 원래 요청 재시도
  → 실패 → /login 리디렉트
```

---

## API 요약

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | /auth/login | X | access_token + refresh_token 발급 |
| POST | /auth/refresh | X | 새 access_token 발급 |
| POST | /auth/logout | O | refresh_token 삭제 |
