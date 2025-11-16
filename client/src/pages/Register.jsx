import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { Separator } from '@/components/ui/separator';

export default function Register() {
  const [email, setEmail] = useState(null);
  const navigate = useNavigate();

  const handleRegisterSuccess = (userEmail) => {
    setEmail(userEmail);
    navigate('/verify-otp', { state: { email: userEmail } });
  };

  if (email) {
    navigate('/verify-otp', { state: { email } });
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-primary-lighter p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-3">
          Đăng ký
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Vui lòng nhập thông tin để tạo tài khoản
        </p>

        <RegisterForm onSuccess={handleRegisterSuccess} />

        <div className="flex items-center my-6">
          <Separator className="flex-1" />
          <span className="mx-3 text-muted-foreground text-sm">OR</span>
          <Separator className="flex-1" />
        </div>

        <GoogleAuthButton text="Đăng ký với Google" />

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Bạn đã có tài khoản?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

