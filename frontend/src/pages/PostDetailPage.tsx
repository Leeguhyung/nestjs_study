import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import type { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch(() => setError('게시글을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/board');
    } catch {
      setError('삭제에 실패했습니다.');
    }
  };

  if (loading) return <div className="loading">불러오는 중...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!post) return null;

  const isAuthor = user?.id === post.author?.id;

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/board" className="btn btn-outline">← 목록으로</Link>
        {isAuthor && (
          <div className="btn-group">
            <Link to={`/board/${id}/edit`} className="btn btn-outline">수정</Link>
            <button onClick={handleDelete} className="btn btn-danger">삭제</button>
          </div>
        )}
      </div>

      <article className="post-detail">
        <h1 className="post-title">{post.title}</h1>
        <div className="post-info">
          <span>{post.author?.username ?? '알 수 없음'}</span>
          <span>{new Date(post.createdAt).toLocaleString('ko-KR')}</span>
          {post.updatedAt !== post.createdAt && (
            <span className="post-edited">(수정됨)</span>
          )}
        </div>
        <div className="post-content">
          {post.content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
