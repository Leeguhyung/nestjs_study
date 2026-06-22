import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await updateProfile(username);
      setSuccess('프로필이 수정되었습니다.');
    } catch {
      setError('프로필 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>프로필 수정</h2>
        <p className="auth-link" style={{ marginBottom: '20px' }}>{user?.email}</p>
        {success && <div className="alert" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>사용자명</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '저장 중...' : '저장'}
          </button>
        </form>
      </div>
    </div>
  );
}
