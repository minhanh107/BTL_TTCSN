import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token không hợp lệ. Vui lòng yêu cầu link đặt lại mật khẩu mới.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      await api.post('/reset-password', {
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Token không hợp lệ</strong>
        <p className="mb-0 mt-2">Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
        <Link to="/forgot-password" className="btn btn-link p-0 mt-2">
          Yêu cầu link mới
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="alert alert-success" role="alert">
        <strong>Đặt lại mật khẩu thành công!</strong>
        <p className="mb-0 mt-2">Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">Mật khẩu mới</label>
        <input
          type="password"
          className="form-control"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          placeholder="Nhập mật khẩu mới"
        />
        <small className="form-text text-muted">Mật khẩu phải có ít nhất 6 ký tự</small>
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
        <input
          type="password"
          className="form-control"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
          placeholder="Nhập lại mật khẩu mới"
        />
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary w-100 mb-3"
        disabled={loading}
        style={{ backgroundColor: '#e91e63', borderColor: '#e91e63' }}
      >
        {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
      </button>

      <div className="text-center">
        <Link to="/login" className="text-decoration-none" style={{ color: '#e91e63' }}>
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  );
}

