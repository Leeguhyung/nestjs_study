# 프로젝트 구조

## 개요

NestJS 백엔드 학습용 풀스택 프로젝트입니다.  
프론트엔드(React)는 미리 완성되어 있으며, **백엔드(NestJS) 개발에만 집중**하면 됩니다.

```
nest_study/
├── frontend/          # React + Vite + TypeScript (완성됨)
├── backend/           # NestJS (개발 대상)
├── PROJECT_STRUCTURE.md
└── API_SPEC.md
```

---

## 프론트엔드 구조 (`frontend/`)

### 실행 방법

```bash
cd frontend
npm run dev       # http://localhost:3000
```

### 디렉토리 트리

```
frontend/
├── src/
│   ├── main.tsx                   # 앱 진입점
│   ├── App.tsx                    # 라우터 설정
│   ├── index.css                  # 글로벌 스타일
│   │
│   ├── types/
│   │   └── index.ts               # 공통 타입 정의 (User, Post, ChatMessage)
│   │
│   ├── api/
│   │   └── axios.ts               # Axios 인스턴스 (JWT 자동 주입)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx        # 로그인 상태 전역 관리
│   │
│   ├── components/
│   │   ├── Navbar.tsx             # 상단 네비게이션 바
│   │   └── PrivateRoute.tsx       # 인증 필요 라우트 보호
│   │
│   └── pages/
│       ├── LoginPage.tsx          # 로그인
│       ├── RegisterPage.tsx       # 회원가입
│       ├── BoardPage.tsx          # 게시글 목록
│       ├── PostDetailPage.tsx     # 게시글 상세 / 삭제
│       ├── CreatePostPage.tsx     # 게시글 작성
│       ├── EditPostPage.tsx       # 게시글 수정
│       ├── ChatPage.tsx           # Socket.IO 실시간 채팅
│       └── QRPage.tsx             # QR 코드 발급
│
├── vite.config.ts                 # 개발 서버 + 프록시 설정
├── package.json
└── tsconfig.json
```

---

## 페이지별 기능 설명

### 인증 (JWT)

| 파일 | 역할 |
|------|------|
| `LoginPage.tsx` | 이메일 + 비밀번호로 로그인, JWT 저장 |
| `RegisterPage.tsx` | 이메일, 사용자명, 비밀번호로 회원가입 |
| `AuthContext.tsx` | 로그인 상태를 전역 Context로 관리. 앱 시작 시 `GET /auth/me`로 세션 복구 |
| `PrivateRoute.tsx` | 비로그인 상태면 `/login`으로 리디렉트 |

**JWT 처리 흐름:**
```
로그인 성공
  → access_token을 localStorage에 저장
  → 이후 모든 API 요청 헤더에 자동으로 Bearer 토큰 첨부 (axios interceptor)
  → 401 응답 시 토큰 삭제 + /login 리디렉트
```

### 게시판

| 파일 | 역할 |
|------|------|
| `BoardPage.tsx` | 전체 게시글 목록 조회. 로그인 시 [글쓰기] 버튼 표시 |
| `PostDetailPage.tsx` | 게시글 상세 조회. 작성자 본인에게만 [수정] [삭제] 버튼 표시 |
| `CreatePostPage.tsx` | 제목 + 내용으로 게시글 작성 (로그인 필요) |
| `EditPostPage.tsx` | 기존 내용 불러와서 수정 (로그인 필요) |

**작성자 판별 방식:**  
`user.id === post.author.id` 비교 → 백엔드가 Post에 author 객체를 포함해서 내려줘야 함

### 실시간 채팅 (Socket.IO)

| 파일 | 역할 |
|------|------|
| `ChatPage.tsx` | 방 이름 입력 후 입장, 실시간 메시지 송수신 |

**Socket 연결 방식:**
```javascript
io('/', {
  path: '/socket.io',
  auth: { token },          // JWT 토큰을 auth 객체로 전달
  transports: ['websocket'],
})
```

**사용하는 이벤트:**
```
클라이언트 → 서버  emit('joinRoom',    { room: '방이름' })
클라이언트 → 서버  emit('sendMessage', { room: '방이름', message: '내용' })

서버 → 클라이언트  emit('roomMessages', ChatMessage[])   // 방 입장 시 이전 메시지
서버 → 클라이언트  emit('message',      ChatMessage)     // 새 메시지 수신
```

### QR 코드 발급

| 파일 | 역할 |
|------|------|
| `QRPage.tsx` | 두 가지 모드로 QR 생성 |

- **클라이언트 모드**: `qrcode` npm 패키지로 브라우저에서 직접 생성 (백엔드 불필요)
- **서버 모드**: `GET /qr/generate?data=...` 호출 → 응답으로 이미지 blob 수신

---

## 네트워크 구조

```
브라우저 (localhost:3000)
    │
    ├── /api/*     → Vite 프록시 → localhost:4000/*   (HTTP REST API)
    └── /socket.io → Vite 프록시 → localhost:4000     (WebSocket)
```

> `vite.config.ts`의 프록시 설정으로 CORS 없이 백엔드를 호출합니다.  
> 백엔드는 반드시 **4000번 포트**에서 실행해야 합니다.

---

## 타입 정의 (`src/types/index.ts`)

프론트엔드가 기대하는 데이터 구조입니다. 백엔드 응답이 이 형태와 일치해야 합니다.

```typescript
interface User {
  id: number;
  email: string;
  username: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: User;       // 중첩 객체 (join 필요)
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;  // ISO 8601
  room: string;
}
```

---

## 백엔드 구현 가이드 (`backend/`)

NestJS로 아래 모듈을 순서대로 구현하는 것을 권장합니다.

```
1단계: Auth 모듈    (회원가입, 로그인, JWT)
2단계: Posts 모듈   (게시판 CRUD + TypeORM)
3단계: Chat 모듈    (Socket.IO Gateway)
4단계: QR 모듈      (QR 이미지 생성 API)
```

권장 패키지:
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install @nestjs/typeorm typeorm
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install qrcode
npm install --save-dev @types/bcrypt @types/qrcode @types/passport-jwt
```

자세한 API 명세는 `API_SPEC.md`를 참고하세요.
