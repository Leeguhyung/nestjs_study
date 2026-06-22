import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const { user } = useAuth();

  const fetchPosts = (kw = '') => {
    setLoading(true);
    api.get('/posts', { params: kw ? { keyword: kw } : {} })
      .then((res) => setPosts(res.data))
      .catch(() => setError('게시글을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <div className="loading">불러오는 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>게시판</h2>
        {user && (
          <Link to="/board/create" className="btn btn-primary">글쓰기</Link>
        )}
      </div>
      <div className="search-bar">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchPosts(keyword)}
          placeholder="제목 또는 내용 검색..."
        />
        <button className="btn btn-primary" onClick={() => fetchPosts(keyword)}>검색</button>
        {keyword && (
          <button className="btn btn-outline" onClick={() => { setKeyword(''); fetchPosts(); }}>초기화</button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>아직 게시글이 없습니다.</p>
          {user && <Link to="/board/create" className="btn btn-primary">첫 글 작성하기</Link>}
        </div>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <Link to={`/board/${post.id}`} key={post.id} className="post-card">
              <div className="post-card-header">
                <h3>{post.title}</h3>
                <span className="post-date">
                  {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <p className="post-preview">
                {post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content}
              </p>
              <div className="post-meta">
                <span className="post-author">{post.author?.username ?? '알 수 없음'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
