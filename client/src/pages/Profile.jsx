import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, fetchUserProfile } from '../store/slices/authSlice';
import api from '../utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, Mail, UserCircle, Phone, MapPin, Save, AlertCircle } from 'lucide-react';

function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch user profile mới nhất khi component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setInitialLoading(true);
        // Gọi API để lấy thông tin user mới nhất từ server
        // Điều này đảm bảo luôn có thông tin mới nhất (bao gồm phone và address)
        await dispatch(fetchUserProfile()).unwrap();
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Không hiển thị error cho user vì có thể dùng thông tin từ store
        // Nếu không có user trong store, sẽ hiển thị message đăng nhập ở phần render
      } finally {
        setInitialLoading(false);
      }
    };

    loadUserProfile();
  }, [dispatch]); // Chỉ chạy một lần khi component mount

  // Update form data khi user data thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      setMessageType('');
      const response = await api.put('/users/profile', formData);
      dispatch(updateUser(response.data));
      setMessage('Cập nhật thông tin thành công');
      setMessageType('success');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Lỗi cập nhật thông tin');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Đang tải thông tin...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>Vui lòng đăng nhập</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <UserCircle className="w-8 h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Thông tin cá nhân</h1>
        </div>

        <Card>
          <CardHeader className="bg-primary-light">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Cập nhật thông tin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email - Disabled */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <Separator />

              {/* Username - Disabled */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Tên đăng nhập
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={user.username}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <Separator />

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Địa chỉ
                </Label>
                <Textarea
                  id="address"
                  placeholder="Nhập địa chỉ"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              {/* Message Alert */}
              {message && (
                <Alert variant={messageType === 'success' ? 'default' : 'destructive'}>
                  {messageType === 'error' && <AlertCircle className="w-4 h-4" />}
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Cập nhật
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Profile;

