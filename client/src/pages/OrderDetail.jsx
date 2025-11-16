import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../store/slices/orderSlice';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import { formatPrice } from '../utils/formatPrice';
import api from '../utils/api';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  User,
  ArrowLeft,
  Loader2,
  Calendar,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

function OrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector((state) => state.orders);
  const [retryLoading, setRetryLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const handleRetryPayment = async () => {
    if (!currentOrder) return;
    
    try {
      setRetryLoading(true);
      const response = await api.post(`/payment/order/${id}/retry`);
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        alert('Không thể tạo link thanh toán. Vui lòng thử lại sau.');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi tạo link thanh toán');
    } finally {
      setRetryLoading(false);
    }
  };

  const getPaymentStatusInfo = () => {
    if (!currentOrder) {
      return {
        label: 'Chưa xác định',
        icon: Clock,
        variant: 'secondary',
        className: 'text-muted-foreground',
        bgColor: 'bg-muted'
      };
    }
    
    if (currentOrder.paymentStatus === 'paid') {
      return {
        label: 'Đã thanh toán',
        icon: CheckCircle2,
        variant: 'default',
        className: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/20'
      };
    } else if (currentOrder.paymentStatus === 'failed') {
      return {
        label: 'Thanh toán thất bại',
        icon: XCircle,
        variant: 'destructive',
        className: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-950/20'
      };
    } else {
      return {
        label: 'Chưa thanh toán',
        icon: Clock,
        variant: 'secondary',
        className: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20'
      };
    }
  };

  const getOrderStatusBadge = () => {
    if (!currentOrder) return { variant: 'secondary', label: 'Chưa xác định' };
    
    const status = currentOrder.status;
    if (status === 'delivered') {
      return { variant: 'default', label: ORDER_STATUS_LABELS[status] || status, className: 'bg-green-500 hover:bg-green-600' };
    } else if (status === 'cancelled') {
      return { variant: 'destructive', label: ORDER_STATUS_LABELS[status] || status };
    } else {
      return { variant: 'secondary', label: ORDER_STATUS_LABELS[status] || status, className: 'bg-amber-500 hover:bg-amber-600' };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Đơn hàng không tồn tại</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link to="/orders">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách đơn hàng
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const paymentStatusInfo = getPaymentStatusInfo();
  const StatusIcon = paymentStatusInfo.icon;
  const orderStatusBadge = getOrderStatusBadge();

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chi tiết đơn hàng</h1>
          <p className="text-muted-foreground mt-1">Mã đơn hàng: #{currentOrder._id.slice(-8).toUpperCase()}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Order Summary Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">Tóm tắt đơn hàng</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ngày đặt: {new Date(currentOrder.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </CardDescription>
              </div>
              <Badge className={orderStatusBadge.className} variant={orderStatusBadge.variant}>
                {orderStatusBadge.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Shipping Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Thông tin giao hàng</h3>
                </div>
                <div className="space-y-3 pl-7">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Họ và tên</p>
                      <p className="font-medium">{currentOrder.shippingAddress.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{currentOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Địa chỉ</p>
                      <p className="font-medium">
                        {currentOrder.shippingAddress.address}
                        {currentOrder.shippingAddress.city && (
                          <span className="block text-sm text-muted-foreground mt-1">
                            {[
                              currentOrder.shippingAddress.ward,
                              currentOrder.shippingAddress.district,
                              currentOrder.shippingAddress.city
                            ].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Thông tin thanh toán</h3>
                </div>
                <div className="space-y-4 pl-7">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phương thức</p>
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {currentOrder.paymentMethod === 'vnpay' ? 'VNPay' : 'COD (Thanh toán khi nhận hàng)'}
                    </Badge>
                  </div>
                  {currentOrder.paymentMethod === 'cod' ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Thông tin</p>
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Đơn hàng COD - Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. Đơn hàng đã được xác nhận và đang được xử lý.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Trạng thái</p>
                        <div className={`flex items-center gap-2 ${paymentStatusInfo.bgColor} rounded-lg p-3 border`}>
                          <StatusIcon className={`h-5 w-5 ${paymentStatusInfo.className}`} />
                          <Badge variant={paymentStatusInfo.variant} className="text-sm px-3 py-1">
                            {paymentStatusInfo.label}
                          </Badge>
                        </div>
                      </div>
                      {/* Chỉ hiển thị nút "Thanh toán lại" khi order status là 'waiting_payment' */}
                      {currentOrder.status === 'waiting_payment' && (currentOrder.paymentStatus === 'pending' || currentOrder.paymentStatus === 'failed') && (
                        <div className="pt-2">
                          <Button
                            onClick={handleRetryPayment}
                            disabled={retryLoading}
                            className="w-full"
                            size="lg"
                          >
                            {retryLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4" />
                                Thanh toán lại
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            Bấm để tạo link thanh toán VNPay mới
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <CardTitle>Sản phẩm</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Sản phẩm</th>
                    <th className="text-left py-3 px-4 font-semibold">Dung tích</th>
                    <th className="text-center py-3 px-4 font-semibold">Số lượng</th>
                    <th className="text-right py-3 px-4 font-semibold">Giá</th>
                    <th className="text-right py-3 px-4 font-semibold">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.items.map((item, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-4 px-4">
                        <p className="font-medium">{item.productName}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline">{item.variant.volume}</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium">{item.quantity}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-muted-foreground">{formatPrice(item.variant.price)}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold">{formatPrice(item.price)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="py-4 px-4 text-right font-semibold">
                      Tổng tiền:
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(currentOrder.totalAmount)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Card */}
        {currentOrder.timeline && currentOrder.timeline.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>Lịch sử đơn hàng</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentOrder.timeline.map((entry, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                      {index < currentOrder.timeline.length - 1 && (
                        <div className="h-full w-0.5 bg-border mt-2 min-h-[40px]" />
                      )}
                    </div>
                    <div className="flex-1 pb-4 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold">
                            {ORDER_STATUS_LABELS[entry.status] || entry.status}
                          </p>
                          {entry.note && (
                            <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default OrderDetail;
