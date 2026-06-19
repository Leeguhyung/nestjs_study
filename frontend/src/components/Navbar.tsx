import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">NestStudy</Link>
      </div>
      <div className="navbar-links">
        <Link to="/board">게시판</Link>
        <Link to="/chat">채팅</Link>
        <Link to="/qr">QR 발급</Link>
      </div>
      <div className="navbar-auth">
        {user ? (
          <>
            <span className="navbar-user">{user.username}</span>
            <button onClick={handleLogout} className="btn btn-outline">로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">로그인</Link>
            <Link to="/register" className="btn btn-primary">회원가입</Link>
          </>
        )}
      </div>
    </nav>
  );
}
