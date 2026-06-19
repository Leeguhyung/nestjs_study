# 백엔드 API 명세서

> 백엔드 서버: `http://localhost:4000`  
> 프론트엔드는 Vite 프록시를 통해 `/api/*` 경로로 호출합니다.

---

## 공통 규칙

### 요청 헤더

인증이 필요한 API는 모든 요청에 아래 헤더를 포함합니다.

```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### 응답 형식

모든 성공 응답은 JSON입니다.  
에러 응답은 NestJS 기본 형식을 따릅니다.

```json
// 에러 응답 예시
{
  "statusCode": 400,
  "message": "이미 존재하는 이메일입니다.",
  "error": "Bad Request"
}
```

### HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | 성공 (조회, 수정) |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 (유효성 검사 실패) |
| 401 | 인증 실패 (토큰 없음 / 만료) |
| 403 | 권한 없음 (타인 게시글 수정/삭제 시도) |
| 404 | 리소스 없음 |

---

## 1. Auth (인증)

### 1-1. 회원가입

```
POST /auth/register
```

**Request Body**
```json
{
  "email": "user@example.com",
  "username": "홍길동",
  "password": "password123"
}
```

**Response** `201`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "홍길동"
}
```

**검증 규칙**
- `email`: 필수, 이메일 형식, 중복 불가
- `username`: 필수, 문자열
- `password`: 필수, 최소 6자, bcrypt로 해싱 저장

---

### 1-2. 로그인

```
POST /auth/login
```

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** `200`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> JWT payload에는 `{ sub: user.id, email: user.email }` 을 담는 것을 권장합니다.

**에러 케이스**
- 이메일 없음 또는 비밀번호 불일치 → `401 Unauthorized`

---

### 1-3. 내 정보 조회

```
GET /auth/me
Authorization: Bearer <token>
```

**Response** `200`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "홍길동"
}
```

> 앱 최초 로드 시 저장된 JWT의 유효성을 확인하는 용도로 사용됩니다.  
> 비밀번호는 응답에 포함하지 마세요.

---

## 2. Posts (게시판)

### 2-1. 게시글 목록 조회

```
GET /posts
```

**Response** `200`
```json
[
  {
    "id": 1,
    "title": "첫 번째 게시글",
    "content": "내용입니다.",
    "author": {
      "id": 1,
      "email": "user@example.com",
      "username": "홍길동"
    },
    "createdAt": "2026-06-19T10:00:00.000Z",
    "updatedAt": "2026-06-19T10:00:00.000Z"
  }
]
```

> `author` 필드는 반드시 포함해야 합니다. TypeORM 사용 시 `relations: ['author']` 옵션이 필요합니다.

---

### 2-2. 게시글 상세 조회

```
GET /posts/:id
```

**Response** `200`
```json
{
  "id": 1,
  "title": "첫 번째 게시글",
  "content": "내용입니다.",
  "author": {
    "id": 1,
    "email": "user@example.com",
    "username": "홍길동"
  },
  "createdAt": "2026-06-19T10:00:00.000Z",
  "updatedAt": "2026-06-19T10:00:00.000Z"
}
```

**에러 케이스**
- 존재하지 않는 id → `404 Not Found`

---

### 2-3. 게시글 작성

```
POST /posts
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "title": "게시글 제목",
  "content": "게시글 내용입니다."
}
```

**Response** `201`
```json
{
  "id": 2,
  "title": "게시글 제목",
  "content": "게시글 내용입니다.",
  "author": {
    "id": 1,
    "email": "user@example.com",
    "username": "홍길동"
  },
  "createdAt": "2026-06-19T11:00:00.000Z",
  "updatedAt": "2026-06-19T11:00:00.000Z"
}
```

**검증 규칙**
- `title`: 필수, 문자열
- `content`: 필수, 문자열
- 인증 토큰 없으면 `401`

---

### 2-4. 게시글 수정

```
PATCH /posts/:id
Authorization: Bearer <token>
```

**Request Body** (부분 수정 가능)
```json
{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

**Response** `200`
```json
{
  "id": 1,
  "title": "수정된 제목",
  "content": "수정된 내용",
  "author": { ... },
  "createdAt": "2026-06-19T10:00:00.000Z",
  "updatedAt": "2026-06-19T12:00:00.000Z"
}
```

**에러 케이스**
- 작성자 본인이 아닌 경우 → `403 Forbidden`
- 존재하지 않는 id → `404 Not Found`

---

### 2-5. 게시글 삭제

```
DELETE /posts/:id
Authorization: Bearer <token>
```

**Response** `200`
```json
{
  "message": "게시글이 삭제되었습니다."
}
```

**에러 케이스**
- 작성자 본인이 아닌 경우 → `403 Forbidden`
- 존재하지 않는 id → `404 Not Found`

---

## 3. QR (QR 코드 발급)

### 3-1. QR 코드 생성

```
GET /qr/generate?data=<텍스트_또는_URL>
```

**Query Parameter**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `data` | string | Y | QR에 인코딩할 텍스트 또는 URL |

**Request 예시**
```
GET /qr/generate?data=https://example.com
```

**Response** `200`  
Content-Type: `image/png`

> 바이너리 이미지(PNG)를 직접 반환합니다.  
> 프론트엔드는 `responseType: 'blob'` 으로 받아 `URL.createObjectURL()`로 표시합니다.

**NestJS 구현 힌트**
```typescript
@Get('generate')
async generateQR(@Query('data') data: string, @Res() res: Response) {
  const qrBuffer = await QRCode.toBuffer(data);
  res.setHeader('Content-Type', 'image/png');
  res.send(qrBuffer);
}
```

---

## 4. Chat (실시간 채팅, Socket.IO)

### 연결 설정

프론트엔드는 다음과 같이 소켓에 연결합니다.

```javascript
io('/', {
  path: '/socket.io',
  auth: { token: '<JWT_ACCESS_TOKEN>' },
  transports: ['websocket'],
})
```

백엔드 Gateway에서 연결 시 `client.handshake.auth.token`으로 JWT를 꺼내 검증합니다.

---

### 이벤트 명세

#### 클라이언트 → 서버

**`joinRoom`** — 채팅방 입장

```typescript
// 페이로드
{ room: string }

// 예시
socket.emit('joinRoom', { room: 'general' })
```

처리 후 서버는 해당 방의 이전 메시지를 `roomMessages` 이벤트로 응답합니다.

---

**`sendMessage`** — 메시지 전송

```typescript
// 페이로드
{ room: string, message: string }

// 예시
socket.emit('sendMessage', { room: 'general', message: '안녕하세요!' })
```

---

#### 서버 → 클라이언트

**`roomMessages`** — 방 입장 시 이전 메시지 목록

```typescript
// ChatMessage[]
[
  {
    "id": "uuid-1234",
    "username": "홍길동",
    "message": "안녕하세요!",
    "timestamp": "2026-06-19T10:00:00.000Z",
    "room": "general"
  }
]
```

---

**`message`** — 새 메시지 수신 (실시간)

```typescript
// ChatMessage
{
  "id": "uuid-5678",
  "username": "홍길동",
  "message": "반갑습니다!",
  "timestamp": "2026-06-19T10:01:00.000Z",
  "room": "general"
}
```

---

### NestJS Gateway 구현 힌트

```typescript
@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection {

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    // JWT 검증 후 연결 허용 or 거부
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: { room: string }) {
    client.join(payload.room);
    // 저장된 메시지를 roomMessages 이벤트로 전송
    client.emit('roomMessages', savedMessages);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, payload: { room: string; message: string }) {
    const msg: ChatMessage = { /* ... */ };
    // 방의 모든 클라이언트에게 브로드캐스트
    this.server.to(payload.room).emit('message', msg);
  }
}
```

---

## 5. 데이터베이스 스키마 (TypeORM 기준)

### User

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;  // bcrypt 해시

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}
```

### Post

```typescript
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.posts, { eager: false })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 구현 순서 권장

```
1단계  Auth 모듈
       ├── UserEntity, UsersModule
       ├── POST /auth/register  (비밀번호 bcrypt 해싱)
       ├── POST /auth/login     (JWT 발급)
       └── GET  /auth/me        (JwtAuthGuard 적용)

2단계  Posts 모듈
       ├── PostEntity, PostsModule
       ├── GET    /posts
       ├── GET    /posts/:id
       ├── POST   /posts        (JwtAuthGuard)
       ├── PATCH  /posts/:id    (JwtAuthGuard + 작성자 확인)
       └── DELETE /posts/:id    (JwtAuthGuard + 작성자 확인)

3단계  Chat 모듈
       ├── ChatGateway          (Socket.IO @WebSocketGateway)
       ├── joinRoom 핸들러
       └── sendMessage 핸들러

4단계  QR 모듈
       └── GET /qr/generate     (qrcode 패키지 → PNG 버퍼 반환)
```
