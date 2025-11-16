import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setFilters } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { fetchAttributes } from '../store/slices/attributeSlice';
import ProductCard from '../components/ProductCard';
import ProductFilter from '../components/ProductFilter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Products() {
  const dispatch = useDispatch();
  const { items, pagination, loading, filters } = useSelector((state) => state.products);
  const { items: categories } = useSelector((state) => state.categories);
  const { byType: attributes } = useSelector((state) => state.attributes);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchAttributes('brand'));
    dispatch(fetchAttributes('gender'));
    dispatch(fetchAttributes('scentGroup'));
    dispatch(fetchAttributes('concentration'));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({ filters, page, limit: 12 }));
  }, [dispatch, filters, page]);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <ProductFilter
            filters={filters}
            categories={categories}
            attributes={attributes}
            onFilterChange={handleFilterChange}
          />
        </div>
        <div className="md:col-span-3">
          <h2 className="mb-6 text-2xl font-bold text-primary">Danh Sách Sản Phẩm</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-[300px] w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <Alert>
              <AlertDescription>Không tìm thấy sản phẩm nào</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={page === i + 1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === pagination.pages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;

