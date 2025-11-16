import ResetPasswordForm from '../components/ResetPassword';

export default function ResetPassword() {
  return (
    <div className="d-flex justify-content-center align-items-center auth-page-container">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '450px', borderRadius: '10px' }}>
        <div className="card-body p-5">
          <h2 className="card-title text-center mb-3" style={{ color: '#333', fontWeight: 'bold' }}>
            Đặt lại mật khẩu
          </h2>
          <p className="text-muted text-center mb-4">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>

          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}

