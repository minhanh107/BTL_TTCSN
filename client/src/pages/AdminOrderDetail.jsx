import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminSidebar from '../components/AdminSidebar';
import api from '../utils/api';
import { ORDER_STATUS_LABELS, ORDER_STATUS } from '../utils/constants';
import { formatPrice } from '../utils/formatPrice';
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
  ShoppingBag,
  Plus,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingTimeline, setAddingTimeline] = useState(false);
  const [timelineForm, setTimelineForm] = useState({
    status: '',
    note: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadOrder();
  }, [user, navigate, id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Define order status flow
  const statusFlow = [
    ORDER_STATUS.WAITING_PAYMENT,
    ORDER_STATUS.PAID,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.DELIVERED
  ];

  // Get available statuses for timeline (current status and forward, plus cancelled)
  const getAvailableStatuses = () => {
    if (!order) return [];
    
    const currentStatusIndex = statusFlow.indexOf(order.status);
    
    // If current status is in flow, return from current status forward
    if (currentStatusIndex !== -1) {
      const availableStatuses = statusFlow.slice(currentStatusIndex);
      // Always allow cancelled from any status
      return [...availableStatuses, ORDER_STATUS.CANCELLED];
    }
    
    // If status is cancelled, only allow cancelled
    if (order.status === ORDER_STATUS.CANCELLED) {
      return [ORDER_STATUS.CANCELLED];
    }
    
    // Fallback: return all statuses
    return Object.values(ORDER_STATUS);
  };

  const handleAddTimeline = async (e) => {
    e.preventDefault();
    if (!timelineForm.status) {
      alert('Vui lòng chọn trạng thái');
      return;
    }

    try {
      setAddingTimeline(true);
      await api.post(`/orders/${id}/timeline`, timelineForm);
      setTimelineForm({ status: '', note: '' });
      await loadOrder(); // Reload order to get updated timeline
      alert('Thêm timeline thành công!');
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi khi thêm timeline');
    } finally {
      setAddingTimeline(false);
    }
  };

  const getPaymentStatusInfo = () => {
    if (!order) {
      return {
        label: 'Chưa xác định',
        icon: Clock,
        variant: 'secondary',
        className: 'text-muted-foreground',
        bgColor: 'bg-muted'
      };
    }
    
    if (order.paymentStatus === 'paid') {
      return {
        label: 'Đã thanh toán',
        icon: CheckCircle2,
        variant: 'default',
        className: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/20'
      };
    } else if (order.paymentStatus === 'failed') {
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
    if (!order) return { variant: 'secondary', label: 'Chưa xác định' };
    
    const status = order.status;
    if (status === 'delivered') {
      return { variant: 'default', label: ORDER_STATUS_LABELS[status] || status, className: 'bg-green-500 hover:bg-green-600' };
    } else if (status === 'cancelled') {
      return { variant: 'destructive', label: ORDER_STATUS_LABELS[status] || status };
    } else if (status === 'paid') {
      return { variant: 'default', label: ORDER_STATUS_LABELS[status] || status, className: 'bg-blue-500 hover:bg-blue-600' };
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

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Đơn hàng không tồn tại</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </div>
    );
  }

  const paymentStatusInfo = getPaymentStatusInfo();
  const StatusIcon = paymentStatusInfo.icon;
  const orderStatusBadge = getOrderStatusBadge();

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminSidebar />
        
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Chi tiết đơn hàng</h1>
              <p className="text-muted-foreground mt-1">Mã đơn hàng: #{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/admin/orders')}>
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Quay lại</span>
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
                      Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN', {
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
                          <p className="font-medium">{order.shippingAddress.fullName}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Số điện thoại</p>
                          <p className="font-medium">{order.shippingAddress.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Địa chỉ</p>
                          <p className="font-medium">
                            {order.shippingAddress.address}
                            {order.shippingAddress.city && (
                              <span className="block text-sm text-muted-foreground mt-1">
                                {[
                                  order.shippingAddress.ward,
                                  order.shippingAddress.district,
                                  order.shippingAddress.city
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
                          {order.paymentMethod === 'vnpay' ? 'VNPay' : order.paymentMethod?.toUpperCase() || 'COD'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Trạng thái</p>
                        <div className={`flex items-center gap-2 ${paymentStatusInfo.bgColor} rounded-lg p-3 border`}>
                          <StatusIcon className={`h-5 w-5 ${paymentStatusInfo.className}`} />
                          <Badge variant={paymentStatusInfo.variant} className="text-sm px-3 py-1">
                            {paymentStatusInfo.label}
                          </Badge>
                        </div>
                      </div>
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
                      {order.items.map((item, index) => (
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
                            {formatPrice(order.totalAmount)}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Add Timeline Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <CardTitle>Thêm timeline</CardTitle>
                </div>
                <CardDescription>Thêm mốc thời gian mới vào lịch sử đơn hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTimeline} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái *</Label>
                    <Select
                      value={timelineForm.status}
                      onValueChange={(value) => setTimelineForm({ ...timelineForm, status: value })}
                      required
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableStatuses().map((status) => (
                          <SelectItem key={status} value={status}>
                            {ORDER_STATUS_LABELS[status] || status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Textarea
                      id="note"
                      placeholder="Nhập ghi chú (tùy chọn)"
                      value={timelineForm.note}
                      onChange={(e) => setTimelineForm({ ...timelineForm, note: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={addingTimeline} className="w-full">
                    {addingTimeline ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm timeline
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            {order.timeline && order.timeline.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <CardTitle>Lịch sử đơn hàng</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.timeline.map((entry, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                          {index < order.timeline.length - 1 && (
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
      </div>
    </div>
  );
}

export default AdminOrderDetail;

