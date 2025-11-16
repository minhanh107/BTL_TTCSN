import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCart, updateItemQuantity, removeItem } from '../store/slices/cartSlice';
import CartItem from '../components/CartItem';
import { formatPrice } from '../utils/formatPrice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

function Cart() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const variant = item.productId?.variants?.[item.variantIndex];
      if (variant) {
        return total + (variant.price * item.quantity);
      }
      return total;
    }, 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>Vui lòng đăng nhập để xem giỏ hàng</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-24 w-24" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Button asChild size="lg">
            <Link to="/products">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">Giỏ hàng</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={item._id}
              item={item}
              onUpdateQuantity={(quantity) => dispatch(updateItemQuantity({ itemId: item._id, quantity }))}
              onRemove={() => dispatch(removeItem(item._id))}
            />
          ))}
        </div>
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="bg-primary-light">
              <CardTitle>Tổng kết</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Tổng tiền:</span>
                <span className="text-primary text-xl">{formatPrice(calculateTotal())}</span>
              </div>
              <Button asChild size="lg" className="w-full">
                <Link to="/checkout">Thanh toán</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/products">Tiếp tục mua sắm</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Cart;

