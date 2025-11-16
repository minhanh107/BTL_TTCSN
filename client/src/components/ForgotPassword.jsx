import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/forgot-password', { email });
      setMessage(response.data.message || 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Nhập email của bạn"
        />
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary w-100 mb-3"
        disabled={loading}
        style={{ backgroundColor: '#e91e63', borderColor: '#e91e63' }}
      >
        {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
      </button>

      <div className="text-center">
        <Link to="/login" className="text-decoration-none" style={{ color: '#e91e63' }}>
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  );
}

