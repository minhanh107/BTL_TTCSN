import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../store/slices/orderSlice';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import { formatPrice } from '../utils/formatPrice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Package, ShoppingBag, LogIn, ExternalLink } from 'lucide-react';

function Orders() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchOrders());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <LogIn className="w-4 h-4" />
          <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span>Vui lòng đăng nhập để xem đơn hàng</span>
            <Button asChild>
              <Link to="/login">Đăng nhập</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto space-y-6">
          <Package className="w-16 h-16 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-primary">Lịch sử đơn hàng</h2>
            <p className="text-muted-foreground mb-6">Bạn chưa có đơn hàng nào</p>
          </div>
          <Button asChild size="lg">
            <Link to="/products">
              <ShoppingBag size={20} />
              Mua sắm ngay
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-8 h-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Lịch sử đơn hàng</h1>
      </div>
      
      <div className="space-y-4">
        {items.map((order) => (
          <Card key={order._id}>
            <CardHeader className="bg-primary-light flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 mb-1">
                  <Package className="w-5 h-5" />
                  Đơn hàng #{order._id.slice(-8)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <Badge variant={getStatusVariant(order.status)} className="text-sm px-3 py-1">
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-3">
                  <h3 className="font-semibold text-lg mb-3">Sản phẩm</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start py-2 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.variant.volume} x {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-primary ml-4">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-1 flex flex-col justify-between">
                  <Separator className="md:hidden mb-4" />
                  <div className="space-y-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Tổng tiền</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/orders/${order._id}`}>
                        Xem chi tiết
                        <ExternalLink size={16} />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Orders;

