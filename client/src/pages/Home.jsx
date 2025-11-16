import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import ProductCard from '../components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  ShoppingBag, 
  Star, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  Award,
  Heart,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

function Home() {
  const dispatch = useDispatch();
  const { items: products, loading: productsLoading } = useSelector((state) => state.products);
  const { items: categories, loading: categoriesLoading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchProducts({ filters: {}, page: 1, limit: 8 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Get featured products (first 8 products or top-rated ones)
  const featuredProducts = products.slice(0, 8);

  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
              Nước Hoa Le Parfum - Cao Cấp
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-white/90 px-4">
              Khám phá bộ sưu tập nước hoa đa dạng và sang trọng
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button asChild size="lg" variant="secondary">
                <Link to="/products">
                  <ShoppingBag size={20} />
                  Mua Ngay
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                <Link to="/products">
                  Xem Bộ Sưu Tập
                  <ArrowRight size={20} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-8 md:py-12 bg-primary-light">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-white border-0 shadow-lg">
            <CardContent className="p-6 md:p-8 lg:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
                    Ưu Đãi Đặc Biệt
                  </h2>
                  <p className="text-base md:text-lg mb-4 md:mb-6 text-white/90">
                    Giảm giá lên đến 30% cho tất cả sản phẩm nước hoa cao cấp. Đừng bỏ lỡ cơ hội này!
                  </p>
                  <Button asChild variant="secondary" size="lg">
                    <Link to="/products">
                      <ShoppingBag size={18} />
                      Mua Ngay
                    </Link>
                  </Button>
                </div>
                <div className="hidden md:block">
                  <Award className="w-24 h-24 lg:w-32 lg:h-32 text-white/20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Danh Mục Sản Phẩm
            </h2>
            <p className="text-muted-foreground text-base md:text-lg px-4">
              Khám phá các danh mục nước hoa phong phú của chúng tôi
            </p>
          </div>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 flex flex-col items-center">
                    <Skeleton className="w-16 h-16 rounded-full mb-4" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="group"
                >
                  <Card className="hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-105 cursor-pointer h-full">
                    <CardContent className="p-6 flex flex-col items-center">
                      <div className="w-16 h-16 bg-primary-light group-hover:bg-white rounded-full flex items-center justify-center mb-4 transition-colors">
                        <Heart className="w-8 h-8 text-primary group-hover:text-primary" />
                      </div>
                      <h3 className="font-semibold text-center">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 md:mb-4">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary fill-primary" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Sản Phẩm Nổi Bật
              </h2>
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-primary fill-primary" />
            </div>
            <p className="text-muted-foreground text-base md:text-lg px-4">
              Những sản phẩm được yêu thích nhất
            </p>
          </div>
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-[300px] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="text-center">
                <Button asChild size="lg">
                  <Link to="/products">
                    <TrendingUp size={20} />
                    Xem Tất Cả Sản Phẩm
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
                Liên Hệ Với Chúng Tôi
              </h2>
              <p className="text-muted-foreground text-base md:text-lg px-4">
                Chúng tôi luôn sẵn sàng hỗ trợ bạn
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="text-center p-6">
                  <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">minhanh1072005@gmail.com</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-6">
                  <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Điện Thoại</h3>
                  <p className="text-muted-foreground">+84 123 456 789</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-6">
                  <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Địa Chỉ</h3>
                  <p className="text-muted-foreground">Nhổn, Bắc Từ Liêm, Hà Nội</p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">Theo dõi chúng tôi trên</p>
              <div className="flex justify-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full bg-primary-light hover:bg-primary hover:text-white">
                  <Facebook className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-primary-light hover:bg-primary hover:text-white">
                  <Instagram className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-primary-light hover:bg-primary hover:text-white">
                  <Twitter className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

