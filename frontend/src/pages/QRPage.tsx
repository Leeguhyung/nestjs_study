import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import QRCode from 'qrcode';
import api from '../api/axios';

type QRMode = 'custom' | 'server';

export default function QRPage() {
  const [mode, setMode] = useState<QRMode>('custom');
  const [inputText, setInputText] = useState('');
  const [serverData, setServerData] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [serverQrUrl, setServerQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateClientQR = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setError('');
    try {
      const url = await QRCode.toDataURL(inputText, { width: 300, margin: 2 });
      setQrDataUrl(url);
    } catch {
      setError('QR 생성에 실패했습니다.');
    }
  };

  const generateServerQR = async (e: FormEvent) => {
    e.preventDefault();
    if (!serverData.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/qr/generate', {
        params: { data: serverData },
        responseType: 'blob',
      });
      const objectUrl = URL.createObjectURL(res.data);
      setServerQrUrl(objectUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || '서버 QR 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (src: string, filename: string) => {
    const a = document.createElement('a');
    a.href = src;
    a.download = filename;
    a.click();
  };

  return (
    <div className="page-container">
      <h2>QR 코드 발급</h2>

      <div className="qr-tabs">
        <button
          className={`tab-btn ${mode === 'custom' ? 'active' : ''}`}
          onClick={() => setMode('custom')}
        >
          클라이언트 생성
        </button>
        <button
          className={`tab-btn ${mode === 'server' ? 'active' : ''}`}
          onClick={() => setMode('server')}
        >
          서버 API 생성
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {mode === 'custom' && (
        <div className="qr-section">
          <p className="qr-desc">브라우저에서 직접 QR 코드를 생성합니다 (백엔드 불필요)</p>
          <form onSubmit={generateClientQR} className="qr-form">
            <div className="form-group">
              <label>텍스트 / URL</label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="https://example.com 또는 원하는 텍스트"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">QR 생성</button>
          </form>
          {qrDataUrl && (
            <div className="qr-result">
              <img src={qrDataUrl} alt="QR Code" />
              <button
                onClick={() => downloadQR(qrDataUrl, 'qrcode.png')}
                className="btn btn-outline"
              >
                다운로드
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'server' && (
        <div className="qr-section">
          <p className="qr-desc">
            NestJS 서버의 <code>GET /qr/generate?data=...</code> API를 호출합니다
          </p>
          <form onSubmit={generateServerQR} className="qr-form">
            <div className="form-group">
              <label>텍스트 / URL</label>
              <input
                type="text"
                value={serverData}
                onChange={(e) => setServerData(e.target.value)}
                placeholder="https://example.com 또는 원하는 텍스트"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '생성 중...' : 'QR 생성 (서버)'}
            </button>
          </form>
          {serverQrUrl && (
            <div className="qr-result">
              <img src={serverQrUrl} alt="Server QR Code" />
              <button
                onClick={() => downloadQR(serverQrUrl, 'server-qrcode.png')}
                className="btn btn-outline"
              >
                다운로드
              </button>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
}
