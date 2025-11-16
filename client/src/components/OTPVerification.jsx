import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../utils/api';
import { login } from '../store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function OTPVerification({ email }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Start countdown for resend OTP (5 minutes = 300 seconds)
    setCountdown(300);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, ''); // Only numbers
    
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 số');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/verify-otp', {
        email,
        code: otpCode
      });
      
      if (response.data) {
        // Dispatch login action với token và user data
        dispatch(login({
          token: response.data.token,
          user: response.data.user
        }));
        // Redirect based on role: admin -> /admin, user -> /
        const redirectPath = response.data.user?.role === 'admin' ? '/admin' : '/';
        navigate(redirectPath);
      }
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Mã OTP không hợp lệ. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    setError('');

    try {
      await api.post('/resend-otp', { email });
      setCountdown(300); // Reset countdown to 5 minutes
      setOtp(['', '', '', '', '', '']);
      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Không thể gửi lại mã OTP. Vui lòng thử lại.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-3">Xác thực OTP</h2>
      <p className="text-muted-foreground mb-4">
        Mã OTP đã được gửi đến email: <strong>{email}</strong>
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex justify-center gap-2 mb-4">
          {otp.map((digit, index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              type="text"
              className="w-12 h-14 text-center text-2xl font-bold"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              maxLength={1}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? 'Đang xác thực...' : 'Xác thực'}
        </Button>

        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Không nhận được mã?{' '}
            {countdown > 0 ? (
              <span>Gửi lại sau {formatTime(countdown)}</span>
            ) : (
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={handleResendOTP}
                disabled={resendLoading}
              >
                {resendLoading ? 'Đang gửi...' : 'Gửi lại mã'}
              </Button>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}

