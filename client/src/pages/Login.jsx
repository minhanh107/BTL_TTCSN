import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      console.error('Login error:', error);
    }
  }, [error]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-primary-lighter p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-3">
          Đăng nhập
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Vui lòng nhập email và mật khẩu để tiếp tục
        </p>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Đăng nhập không thành công.</AlertTitle>
            <AlertDescription>
              <p className="mt-2 text-sm">
                {error === 'oauth_failed' 
                  ? 'Không thể đăng nhập bằng Google. Vui lòng thử lại hoặc đăng nhập bằng email/password.'
                  : 'Vui lòng thử lại.'}
              </p>
              {searchParams.get('details') && (
                <small className="block mt-2 text-xs">
                  Chi tiết: {searchParams.get('details')}
                </small>
              )}
            </AlertDescription>
          </Alert>
        )}

        <LoginForm />

        <div className="flex items-center my-6">
          <Separator className="flex-1" />
          <span className="mx-3 text-muted-foreground text-sm">OR</span>
          <Separator className="flex-1" />
        </div>

        <GoogleAuthButton />

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Tạo tài khoản
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

