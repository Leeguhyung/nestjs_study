export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthTokens {
  access_token: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  room: string;
}
