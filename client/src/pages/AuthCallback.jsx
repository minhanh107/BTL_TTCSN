import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import api from '../utils/api';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (token && email) {
      // Verify token and get user info
      const verifyAndLogin = async () => {
        try {
          // Verify token with backend using axios directly with token in header
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          const response = await fetch(`${API_URL}/verify-token`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          
          if (data.valid) {
            const user = {
              id: data.user.id,
              email: data.user.email,
              username: data.user.username,
              role: data.user.role || 'user'
            };
            // Dispatch login action với token và user data
            dispatch(login({ token, user }));
            // Redirect based on role: admin -> /admin, user -> /
            const redirectPath = user.role === 'admin' ? '/admin' : '/';
            navigate(redirectPath);
          } else {
            setError('Token không hợp lệ');
            setTimeout(() => navigate('/login?error=oauth_failed'), 2000);
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          setError('Đăng nhập không thành công');
          setTimeout(() => navigate('/login?error=oauth_failed'), 2000);
        }
      };

      verifyAndLogin();
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, navigate, dispatch]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-primary-lighter p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="text-muted-foreground">Đang chuyển hướng...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-primary-lighter p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center p-8">
          <div className="flex justify-center mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <p className="text-muted-foreground mt-3">Đang xử lý đăng nhập...</p>
        </CardContent>
      </Card>
    </div>
  );
}

