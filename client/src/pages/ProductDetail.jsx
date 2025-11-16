import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import api from '../utils/api';
import ProductImageGallery from '../components/ProductImageGallery';
import VariantSelector from '../components/VariantSelector';
import { formatPrice } from '../utils/formatPrice';
import RatingForm from '../components/RatingForm';
import RatingList from '../components/RatingList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShoppingCart, Star } from 'lucide-react';

function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, loading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [ratings, setRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    loadRatings();
  }, [dispatch, id]);

  const loadRatings = async () => {
    try {
      setLoadingRatings(true);
      const [ratingsRes, statsRes] = await Promise.all([
        api.get(`/ratings/product/${id}`),
        api.get(`/ratings/product/${id}/stats`)
      ]);
      setRatings(ratingsRes.data.ratings || []);
      setRatingStats(statsRes.data);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoadingRatings(false);
    }
  };

  const navigate = useNavigate();
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (selectedVariantIndex === null) {
      alert('Vui lòng chọn dung tích');
      return;
    }
    dispatch(addToCart({
      productId: id,
      variantIndex: selectedVariantIndex,
      quantity
    }));
    setAddToCartSuccess(true);
    setTimeout(() => setAddToCartSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[500px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Sản phẩm không tồn tại</AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedVariant = currentProduct.variants[selectedVariantIndex];

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
        <div>
          <ProductImageGallery images={currentProduct.images} />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
              {currentProduct.name}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {currentProduct.attributes?.brand && (
                <Badge variant="outline">
                  Thương hiệu: {currentProduct.attributes.brand.value || currentProduct.attributes.brand}
                </Badge>
              )}
              {currentProduct.attributes?.gender && (
                <Badge variant="outline">
                  {currentProduct.attributes.gender.value || currentProduct.attributes.gender}
                </Badge>
              )}
              {currentProduct.attributes?.scentGroup && (
                <Badge variant="outline">
                  {currentProduct.attributes.scentGroup.value || currentProduct.attributes.scentGroup}
                </Badge>
              )}
            </div>
          </div>

          {/* Attributes Table */}
          {(currentProduct.attributes?.brand || 
            currentProduct.attributes?.gender || 
            currentProduct.attributes?.scentGroup ||
            currentProduct.attributes?.origin ||
            currentProduct.attributes?.concentration ||
            currentProduct.attributes?.perfumer ||
            currentProduct.attributes?.style) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Thông tin sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {currentProduct.attributes?.brand && (
                      <TableRow>
                        <TableHead className="w-[150px] font-semibold">Thương hiệu</TableHead>
                        <TableCell>{currentProduct.attributes.brand.value || currentProduct.attributes.brand}</TableCell>
                      </TableRow>
                    )}
                    {currentProduct.attributes?.gender && (
                      <TableRow>
                        <TableHead className="font-semibold">Giới tính</TableHead>
                        <TableCell>{currentProduct.attributes.gender.value || currentProduct.attributes.gender}</TableCell>
                      </TableRow>
                    )}
                    {currentProduct.attributes?.scentGroup && (
                      <TableRow>
                        <TableHead className="font-semibold">Nhóm hương</TableHead>
                        <TableCell>{currentProduct.attributes.scentGroup.value || currentProduct.attributes.scentGroup}</TableCell>
                      </TableRow>
                    )}
                    {currentProduct.attributes?.origin && (
                      <TableRow>
                        <TableHead className="font-semibold">Xuất xứ</TableHead>
                        <TableCell>{currentProduct.attributes.origin.value || currentProduct.attributes.origin}</TableCell>
                      </TableRow>
                    )}
                    {currentProduct.attributes?.concentration && (
                      <TableRow>
                        <TableHead className="font-semibold">Nồng độ</TableHead>
                        <TableCell>{currentProduct.attributes.concentration.value || currentProduct.attributes.concentration}</TableCell>
                      </TableRow>
                    )}
                    {currentProduct.attributes?.perfumer && (
                      <TableRow>
                        <TableHead className="font-semibold">Nhà điều chế</TableHead>
                        <TableCell>{currentProduct.attributes.perfumer.value || currentProduct.attributes.perfumer}</TableCell>
                      </TableRow>
                    )}
                    {currentProduct.attributes?.style && (
                      <TableRow>
                        <TableHead className="font-semibold">Phong cách</TableHead>
                        <TableCell>{currentProduct.attributes.style}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Separator />

          <div>
            <Label className="text-base font-semibold mb-3 block">Chọn dung tích:</Label>
            <VariantSelector
              variants={currentProduct.variants}
              selectedVariantIndex={selectedVariantIndex}
              onSelect={setSelectedVariantIndex}
            />
          </div>

          {selectedVariant && (
            <>
              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl md:text-4xl font-bold text-primary">
                  {formatPrice(selectedVariant.price)}
                </h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng:</Label>
                <Input
                  id="quantity"
                  type="number"
                  className="w-24"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              {addToCartSuccess && (
                <Alert>
                  <AlertDescription>Đã thêm vào giỏ hàng thành công!</AlertDescription>
                </Alert>
              )}

              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={20} />
                Thêm vào giỏ hàng
              </Button>
            </>
          )}

          <Separator />

          {/* Product Description Accordion */}
          {currentProduct.description && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger className="text-lg font-semibold">
                  Mô tả sản phẩm
                </AccordionTrigger>
                <AccordionContent>
                  <div 
                    className="text-muted-foreground product-description prose max-w-none prose-headings:font-semibold prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: currentProduct.description }}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </div>

      <Separator className="my-8" />

      <div className="space-y-6">
        <h3 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h3>
        
        {ratingStats && (
          <Card className="bg-primary-light">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-6 h-6 text-primary fill-primary" />
                    <h4 className="text-2xl font-bold">{ratingStats.overallAverage.toFixed(1)}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
                </div>
                <div>
                  <p className="text-lg font-semibold mb-1">{ratingStats.averageScentRating.toFixed(1)}/5</p>
                  <p className="text-sm text-muted-foreground">Mùi hương</p>
                </div>
                <div>
                  <p className="text-lg font-semibold mb-1">{ratingStats.averageLongevityRating.toFixed(1)}/5</p>
                  <p className="text-sm text-muted-foreground">Độ lưu hương</p>
                </div>
                <div>
                  <p className="text-lg font-semibold mb-1">{ratingStats.averageEffectivenessRating.toFixed(1)}/5</p>
                  <p className="text-sm text-muted-foreground">Hiệu quả</p>
                </div>
              </div>
              <p className="text-center mt-4 text-sm text-muted-foreground">
                {ratingStats.count} đánh giá
              </p>
            </CardContent>
          </Card>
        )}

        {isAuthenticated && (
          <div className="flex justify-start">
            <RatingForm productId={id} onRatingSubmitted={loadRatings} />
          </div>
        )}

        <RatingList ratings={ratings} loading={loadingRatings} />
      </div>
    </div>
  );
}

export default ProductDetail;

