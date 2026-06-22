# 게시글 검색 & 프로필 수정 구현 명세서

---

## 1. 게시글 검색

### API

```
GET /posts?keyword=검색어
```

| 파라미터 | 위치 | 타입 | 필수 | 설명 |
|---------|------|------|------|------|
| `keyword` | Query | string | N | 검색어. 없으면 전체 목록 반환 |

**Request 예시**
```
GET /posts?keyword=NestJS
```

**Response** `200`
```json
[
  {
    "id": 1,
    "title": "NestJS 공부 시작",
    "content": "오늘부터 NestJS를 공부합니다.",
    "author": {
      "id": 1,
      "email": "user@example.com",
      "username": "홍길동"
    },
    "createdAt": "2026-06-22T10:00:00.000Z",
    "updatedAt": "2026-06-22T10:00:00.000Z"
  }
]
```

---

### post.service.ts 수정

`posts()` 메서드에 `keyword` 파라미터를 추가하고 `where` 조건을 적용합니다.

**핵심 개념**

- `@Query('keyword')` — URL 쿼리 파라미터를 받는 데코레이터
- `prisma.post.findMany({ where: {...} })` — 조건부 조회
- `contains` — 특정 문자열 포함 여부 검색
- `mode: 'insensitive'` — 대소문자 구분 없이 검색
- `OR` — 여러 조건 중 하나라도 만족하면 반환

**where 조건 구조**

keyword가 있을 때만 where 조건을 붙여야 합니다.

```
keyword 없음 → findMany() 전체 조회
keyword 있음 → findMany({ where: { OR: [ title 검색, content 검색 ] } })
```

Prisma에서 `OR` 조건은 배열로 넘깁니다.
```
where: {
  OR: [
    { title: { contains: keyword, mode: 'insensitive' } },
    { content: { contains: keyword, mode: 'insensitive' } },
  ]
}
```

---

### post.controller.ts 수정

`@Query()` 데코레이터로 keyword를 받아서 서비스에 넘깁니다.

```
@Get()
async posts(@Query('keyword') keyword?: string)
```

`keyword`는 선택값이므로 `?`(옵셔널)로 선언합니다.

---

## 2. 프로필 수정

### API

```
PATCH /auth/profile
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "username": "새로운이름"
}
```

**Response** `200`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "새로운이름"
}
```

**에러 케이스**
- 토큰 없음 → `401 Unauthorized`

---

### auth.service.ts 수정

`updateProfile(userId, username)` 메서드를 추가합니다.

**핵심 개념**
- `prisma.user.update()` — 특정 레코드 수정
- `where: { id: userId }` — 수정 대상 지정
- `data: { username }` — 수정할 필드
- `select` 또는 구조분해로 `password` 제외 후 반환

---

### auth.controller.ts 수정

`PATCH /auth/profile` 엔드포인트를 추가합니다.

**필요한 것들**
- `@UseGuards(JwtAuthGuard)` — 인증 필요
- `@Req()` — `req.user.id`로 현재 로그인한 유저 id 꺼내기
- `@Body()` — `username` 받기
- `authService.updateProfile()` 호출

---

## 구현 순서

```
1. post.service.ts  — posts()에 keyword 파라미터 + where 조건 추가
2. post.controller.ts — @Query('keyword') 추가
3. auth.service.ts  — updateProfile() 메서드 추가
4. auth.controller.ts — PATCH /auth/profile 엔드포인트 추가
```
