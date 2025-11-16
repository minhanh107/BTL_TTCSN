import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function ProductCard({ product }) {
  const minPrice = product.variants?.length > 0
    ? Math.min(...product.variants.map(v => v.price))
    : 0;

  const mainImage = product.images?.[0] || 'https://via.placeholder.com/300';
  const brandName = product.attributes?.brand?.value || product.attributes?.brand || null;

  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/products/${product._id}`} className="block">
        <img
          src={mainImage}
          className="w-full h-[300px] object-cover"
          alt={product.name}
        />
        <CardHeader className="space-y-2">
          <CardTitle className="line-clamp-2 text-base text-primary font-semibold hover:text-primary-hover transition-colors">
            {product.name}
          </CardTitle>
          {brandName && (
            <Badge variant="secondary" className="w-fit bg-primary-light text-primary border border-primary/20 hover:bg-primary-lighter transition-colors">
              {brandName}
            </Badge>
          )}
        </CardHeader>
        <CardFooter className="mt-auto border-t bg-surface">
          <p className="text-lg font-bold text-primary">
            Từ {formatPrice(minPrice)}
          </p>
        </CardFooter>
      </Link>
    </Card>
  );
}

export default ProductCard;

