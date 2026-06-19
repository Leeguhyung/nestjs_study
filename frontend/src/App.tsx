import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardPage from './pages/BoardPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import ChatPage from './pages/ChatPage';
import QRPage from './pages/QRPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/board" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/board/:id" element={<PostDetailPage />} />
            <Route
              path="/board/create"
              element={<PrivateRoute><CreatePostPage /></PrivateRoute>}
            />
            <Route
              path="/board/:id/edit"
              element={<PrivateRoute><EditPostPage /></PrivateRoute>}
            />
            <Route
              path="/chat"
              element={<PrivateRoute><ChatPage /></PrivateRoute>}
            />
            <Route path="/qr" element={<QRPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
