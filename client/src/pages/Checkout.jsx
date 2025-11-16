import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';
import { formatPrice } from '../utils/formatPrice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Package, Shield } from 'lucide-react';
import provinceData from '../lib/data/province.json';

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    province: '',
    ward: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to COD
  const [loading, setLoading] = useState(false);

  // Get selected province
  const selectedProvince = useMemo(() => {
    return provinceData.find(p => p.province_code === shippingAddress.province);
  }, [shippingAddress.province]);

  // Get wards for selected province
  const availableWards = useMemo(() => {
    if (!selectedProvince) return [];
    return selectedProvince.wards || [];
  }, [selectedProvince]);

  // Validate form - check if all required fields are filled
  const isFormValid = useMemo(() => {
    return (
      shippingAddress.fullName.trim() !== '' &&
      shippingAddress.phone.trim() !== '' &&
      shippingAddress.address.trim() !== '' &&
      shippingAddress.province !== '' &&
      shippingAddress.ward !== ''
    );
  }, [shippingAddress]);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const variant = item.productId?.variants?.[item.variantIndex];
      if (variant) {
        return total + (variant.price * item.quantity);
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }

    if (!shippingAddress.province || !shippingAddress.ward) {
      alert('Vui lòng chọn đầy đủ Tỉnh/Thành phố và Phường/Xã');
      return;
    }

    try {
      setLoading(true);
      
      // Format shipping address with province and ward names
      const selectedWard = availableWards.find(w => w.ward_code === shippingAddress.ward);
      const formattedAddress = {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: selectedProvince?.name || '',
        district: selectedProvince?.name || '', // Add district field
        ward: selectedWard?.name || shippingAddress.ward
      };
      
      const result = await dispatch(createOrder({ 
        shippingAddress: formattedAddress,
        paymentMethod 
      })).unwrap();
      
      console.log('Order created successfully:', result);
      
      // Redirect to VNPay payment page if VNPay is selected
      if (paymentMethod === 'vnpay' && result.paymentUrl) {
        console.log('Redirecting to payment URL:', result.paymentUrl);
        window.location.href = result.paymentUrl;
      } else {
        // For COD, redirect to order detail page
        if (!result._id && !result.id) {
          console.error('Order ID missing in response:', result);
          alert('Đặt hàng thành công nhưng không tìm thấy mã đơn hàng. Vui lòng kiểm tra lại.');
          return;
        }
        alert('Đặt hàng thành công!');
        navigate(`/orders/${result._id || result.id}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error || 'Lỗi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Giỏ hàng trống</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Thanh toán</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader className="bg-primary-light">
                <CardTitle>Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Địa chỉ *</Label>
                  <Input
                    id="address"
                    type="text"
                    required
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                    <Select
                      value={shippingAddress.province}
                      onValueChange={(value) => {
                        setShippingAddress({ 
                          ...shippingAddress, 
                          province: value,
                          ward: '' // Reset ward when province changes
                        });
                      }}
                      required
                    >
                      <SelectTrigger id="province">
                        <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {provinceData.map((province) => (
                          <SelectItem key={province.province_code} value={province.province_code}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ward">Phường/Xã *</Label>
                    <Select
                      value={shippingAddress.ward}
                      onValueChange={(value) => {
                        setShippingAddress({ ...shippingAddress, ward: value });
                      }}
                      disabled={!selectedProvince}
                      required
                    >
                      <SelectTrigger id="ward">
                        <SelectValue placeholder={selectedProvince ? "Chọn Phường/Xã" : "Chọn Tỉnh/Thành phố trước"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableWards.map((ward) => (
                          <SelectItem key={ward.ward_code} value={ward.ward_code}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-primary-light">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard size={20} />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* COD Option */}
                  <div 
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cod' 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-background border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {paymentMethod === 'cod' && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="font-semibold cursor-pointer">
                          Thanh toán khi nhận hàng (COD)
                        </Label>
                        <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded">
                          Khuyến nghị
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Thanh toán bằng tiền mặt khi nhận hàng. Không cần thanh toán trước.
                      </p>
                    </div>
                  </div>

                  {/* VNPay Option */}
                  <div 
                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'vnpay' 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-background border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setPaymentMethod('vnpay')}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'vnpay' ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {paymentMethod === 'vnpay' && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="font-semibold cursor-pointer">
                          Thanh toán qua VNPay
                        </Label>
                        <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                          Bảo mật
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Thanh toán an toàn và nhanh chóng qua cổng thanh toán VNPay. Hỗ trợ thẻ ATM, thẻ tín dụng và ví điện tử.
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    {paymentMethod === 'cod' ? (
                      <>
                        <p>• Thanh toán bằng tiền mặt khi nhận hàng</p>
                        <p>• Không cần thanh toán trước</p>
                        <p>• Đơn hàng sẽ được xác nhận ngay sau khi đặt</p>
                      </>
                    ) : (
                      <>
                        <p>• Thanh toán được xử lý bởi VNPay - đối tác thanh toán uy tín</p>
                        <p>• Thông tin thanh toán được mã hóa và bảo mật</p>
                        <p>• Bạn sẽ được chuyển đến trang thanh toán VNPay sau khi đặt hàng</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || !isFormValid}
            >
              {loading ? 'Đang xử lý...' : paymentMethod === 'cod' ? 'Đặt hàng' : 'Đặt hàng và thanh toán'}
            </Button>
          </form>
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="bg-primary-light">
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                {items.map((item) => {
                  const variant = item.productId?.variants?.[item.variantIndex];
                  return (
                    <div key={item._id} className="pb-3 border-b last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium flex-1">{item.productId?.name} ({variant?.volume})</span>
                        <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                      </div>
                      <div className="text-end text-sm text-muted-foreground">
                        {formatPrice(variant?.price * item.quantity || 0)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Tổng tiền:</span>
                <span className="text-primary text-xl">{formatPrice(calculateTotal())}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

