import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import OTPVerification from '../components/OTPVerification';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  return (
    <div className="d-flex justify-content-center align-items-center auth-page-container">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '450px', borderRadius: '10px' }}>
        <div className="card-body p-5">
          <OTPVerification email={email} />
        </div>
      </div>
    </div>
  );
}

