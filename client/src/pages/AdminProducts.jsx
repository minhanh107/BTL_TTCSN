import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminSidebar from '../components/AdminSidebar';
import ProductForm from '../components/ProductForm';
import api from '../utils/api';
import { formatPrice } from '../utils/formatPrice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

function AdminProducts() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadCategoriesAndAttributes();
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'admin' && !showForm) {
      loadProducts();
    }
  }, [page, user, showForm]);

  const loadCategoriesAndAttributes = async () => {
    try {
      const [categoriesRes, brandRes, genderRes, originRes, concentrationRes, perfumerRes, scentGroupRes] = await Promise.all([
        api.get('/categories'),
        api.get('/attributes?type=brand'),
        api.get('/attributes?type=gender'),
        api.get('/attributes?type=origin'),
        api.get('/attributes?type=concentration'),
        api.get('/attributes?type=perfumer'),
        api.get('/attributes?type=scentGroup')
      ]);

      setCategories(categoriesRes.data || []);
      setAttributes({
        brand: brandRes.data || [],
        gender: genderRes.data || [],
        origin: originRes.data || [],
        concentration: concentrationRes.data || [],
        perfumer: perfumerRes.data || [],
        scentGroup: scentGroupRes.data || []
      });
    } catch (error) {
      console.error('Error loading categories and attributes:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsRes = await api.get(`/products?page=${page}&limit=${pagination.limit}`);
      
      setProducts(productsRes.data.products || []);
      setPagination(productsRes.data.pagination || {
        page: 1,
        limit: pagination.limit,
        total: 0,
        pages: 0
      });
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([loadProducts(), loadCategoriesAndAttributes()]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi xóa sản phẩm');
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Skeleton className="h-8 w-full max-w-4xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminSidebar />
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary">Quản lý Sản phẩm</h2>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
            >
              <Plus size={18} className="mr-2" />
              Thêm sản phẩm
            </Button>
          </div>

          {showForm ? (
            <ProductForm
              product={editingProduct}
              categories={categories}
              attributes={attributes}
              onSave={() => {
                setShowForm(false);
                setEditingProduct(null);
                loadProducts();
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ảnh</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => {
                        const minPrice = product.variants?.length > 0
                          ? Math.min(...product.variants.map(v => v.price))
                          : 0;
                        return (
                          <TableRow key={product._id}>
                            <TableCell>
                              <img
                                src={product.images?.[0] || 'https://via.placeholder.com/50'}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="font-semibold text-primary">{formatPrice(minPrice)}</TableCell>
                            <TableCell>{product.category?.name || '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setShowForm(true);
                                  }}
                                >
                                  <Edit size={16} className="mr-1" />
                                  Sửa
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(product._id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 size={16} className="mr-1" />
                                  Xóa
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Hiển thị {(page - 1) * pagination.limit + 1} - {Math.min(page * pagination.limit, pagination.total)} trong tổng số {pagination.total} sản phẩm
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft size={16} className="mr-1" />
                        Trước
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(pagination.pages)].map((_, i) => {
                          const pageNum = i + 1;
                          // Show first page, last page, current page, and pages around current
                          if (
                            pageNum === 1 ||
                            pageNum === pagination.pages ||
                            (pageNum >= page - 1 && pageNum <= page + 1)
                          ) {
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className="min-w-[40px]"
                              >
                                {pageNum}
                              </Button>
                            );
                          } else if (
                            pageNum === page - 2 ||
                            pageNum === page + 2
                          ) {
                            return (
                              <span key={pageNum} className="px-2 text-muted-foreground">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === pagination.pages}
                      >
                        Sau
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;
