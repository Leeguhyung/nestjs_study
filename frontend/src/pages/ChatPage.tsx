import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import type { ChatMessage } from '../types';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [room, setRoom] = useState('general');
  const [roomInput, setRoomInput] = useState('general');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const socket = io('/', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinRoom', { room });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('roomMessages', (msgs: ChatMessage[]) => {
      setMessages(msgs);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinRoom = () => {
    if (!roomInput.trim()) return;
    setRoom(roomInput);
    setMessages([]);
    socketRef.current?.emit('joinRoom', { room: roomInput });
  };

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('sendMessage', { room, message: input });
    setInput('');
  };

  return (
    <div className="page-container">
      <h2>실시간 채팅</h2>

      <div className="chat-layout">
        <div className="chat-sidebar">
          <h4>채팅방 입장</h4>
          <div className="room-join">
            <input
              type="text"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              placeholder="방 이름"
            />
            <button onClick={joinRoom} className="btn btn-primary">입장</button>
          </div>
          <div className="current-room">
            <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
            현재: <strong>{room}</strong>
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-chat">메시지가 없습니다. 첫 메시지를 보내보세요!</div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble ${msg.username === user?.username ? 'mine' : 'theirs'}`}
              >
                {msg.username !== user?.username && (
                  <span className="bubble-author">{msg.username}</span>
                )}
                <div className="bubble-text">{msg.message}</div>
                <span className="bubble-time">
                  {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chat-input-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={connected ? '메시지를 입력하세요...' : '연결 중...'}
              disabled={!connected}
            />
            <button type="submit" className="btn btn-primary" disabled={!connected || !input.trim()}>
              전송
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
