import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Minus, Plus } from 'lucide-react';

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const product = item.productId;
  const variant = product?.variants?.[item.variantIndex];

  if (!product || !variant) {
    return null;
  }

  const mainImage = product.images?.[0] || 'https://via.placeholder.com/150';
  const totalPrice = variant.price * item.quantity;

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Link to={`/products/${product._id}`} className="flex-shrink-0">
            <img
              src={mainImage}
              alt={product.name}
              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/products/${product._id}`} className="hover:text-primary transition-colors">
              <h6 className="font-semibold text-base md:text-lg mb-1 line-clamp-2">{product.name}</h6>
            </Link>
            <p className="text-sm text-muted-foreground mb-1">Dung tích: {variant.volume}</p>
            <p className="text-sm text-muted-foreground">Giá: {formatPrice(variant.price)}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
                disabled={item.quantity <= 1}
              >
                <Minus size={16} />
              </Button>
              <Input
                type="number"
                className="w-16 text-center h-9"
                value={item.quantity}
                onChange={(e) => {
                  const qty = parseInt(e.target.value) || 1;
                  onUpdateQuantity(Math.max(1, qty));
                }}
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <h6 className="text-primary font-bold text-lg">{formatPrice(totalPrice)}</h6>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                onClick={onRemove}
              >
                <Trash2 size={16} />
                <span className="ml-1">Xóa</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CartItem;

