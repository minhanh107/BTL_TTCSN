import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/ForgotPassword';

export default function ForgotPasswordPage() {
  return (
    <div className="d-flex justify-content-center align-items-center auth-page-container">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '450px', borderRadius: '10px' }}>
        <div className="card-body p-5">
          <h2 className="card-title text-center mb-3" style={{ color: '#333', fontWeight: 'bold' }}>
            Quên mật khẩu
          </h2>
          <p className="text-muted text-center mb-4">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>

          <ForgotPasswordForm />

          <div className="text-center mt-4">
            <p className="text-muted">
              Nhớ mật khẩu?{' '}
              <Link to="/login" className="text-decoration-none" style={{ color: '#e91e63' }}>
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

