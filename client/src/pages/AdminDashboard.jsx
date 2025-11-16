import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import api from '../utils/api';
import { formatPrice } from '../utils/formatPrice';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, ShoppingCart, Package, Users, Eye, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    successOrders: 0,
    failedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30'); // '1', '7', '30', 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadStats();
    loadChartData();
  }, [user, navigate]);

  useEffect(() => {
    loadChartData();
    loadStats(); // Reload stats when date range changes
  }, [dateRange, customStartDate, customEndDate]);

  // Helper function to get date in UTC+7 timezone
  const getDateInUTC7 = (date) => {
    // Get local date in UTC+7
    // JavaScript Date is already in local timezone, but we need to format it correctly
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDateRange = () => {
    // Get current date in local timezone (UTC+7)
    const today = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case '1':
        // 1 ngày: hôm nay (UTC+7)
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '7':
        // 7 ngày: tuần qua (UTC+7)
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case '30':
        // 30 ngày: tháng qua (UTC+7)
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        // Custom range
        if (customStartDate && customEndDate) {
          // Parse dates as UTC+7 (local timezone)
          startDate = new Date(customStartDate + 'T00:00:00+07:00');
          endDate = new Date(customEndDate + 'T23:59:59+07:00');
        } else {
          return { startDate: null, endDate: null };
        }
        break;
      default:
        return { startDate: null, endDate: null };
    }

    // Return dates in YYYY-MM-DD format using UTC+7 timezone
    return {
      startDate: getDateInUTC7(startDate),
      endDate: getDateInUTC7(endDate)
    };
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const { startDate, endDate } = getDateRange();
      
      // Load all stats in parallel
      const [revenueRes, productsRes, usersRes, ordersRes, orderStatsRes] = await Promise.all([
        api.get('/orders/stats/revenue', { 
          params: startDate && endDate ? { startDate, endDate } : {} 
        }).catch(() => ({ data: { totalRevenue: 0, totalOrders: 0 } })),
        api.get('/products?limit=1').catch(() => ({ data: { pagination: { total: 0 } } })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/orders?limit=5').catch(() => ({ data: [] })),
        api.get('/orders/stats/orders', { 
          params: startDate && endDate ? { startDate, endDate } : {} 
        }).catch(() => ({ data: { success: 0, failed: 0, total: 0 } }))
      ]);

      // Extract data with proper fallbacks
      const revenueData = revenueRes.data || {};
      const productsData = productsRes.data || {};
      const usersData = usersRes.data || [];
      const ordersData = ordersRes.data || [];
      const orderStatsData = orderStatsRes.data || {};

      setStats({
        totalRevenue: revenueData.totalRevenue || 0,
        totalOrders: revenueData.totalOrders || (Array.isArray(ordersData) ? ordersData.length : 0),
        totalProducts: productsData.pagination?.total || productsData.products?.length || 0,
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        successOrders: orderStatsData.success || 0,
        failedOrders: orderStatsData.failed || 0
      });

      setRecentOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default values on error
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        successOrders: 0,
        failedOrders: 0
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      setChartLoading(true);
      const { startDate, endDate } = getDateRange();
      
      if (!startDate || !endDate) {
        setChartData([]);
        return;
      }

      const response = await api.get('/orders/stats/revenue/chart', {
        params: { startDate, endDate }
      });
      
      // Format date for display
      const formattedData = response.data.map(item => ({
        ...item,
        dateLabel: new Date(item.date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit'
        })
      }));
      
      setChartData(formattedData);
    } catch (error) {
      console.error('Error loading chart data:', error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'waiting_payment':
      case 'paid':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="space-y-4 w-full max-w-4xl">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminSidebar />
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-bold text-primary">Dashboard Quản Trị</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-primary-light border-primary/20">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-primary mb-1">{formatPrice(stats.totalRevenue)}</h3>
                <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-light border-primary/20">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-primary mb-1">{stats.totalOrders}</h3>
                <p className="text-sm text-muted-foreground">Tổng đơn hàng</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/20">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.successOrders}</h3>
                <p className="text-sm text-muted-foreground">Đơn hàng thành công</p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/20">
              <CardContent className="p-6 text-center">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{stats.failedOrders}</h3>
                <p className="text-sm text-muted-foreground">Đơn hàng thất bại</p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-light border-primary/20">
              <CardContent className="p-6 text-center">
                <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-primary mb-1">{stats.totalProducts}</h3>
                <p className="text-sm text-muted-foreground">Sản phẩm</p>
              </CardContent>
            </Card>
            
            <Card className="bg-primary-light border-primary/20">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-primary mb-1">{stats.totalUsers}</h3>
                <p className="text-sm text-muted-foreground">Người dùng</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader className="bg-primary-light border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Biểu đồ doanh thu
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Chọn khoảng thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 ngày</SelectItem>
                      <SelectItem value="7">7 ngày</SelectItem>
                      <SelectItem value="30">30 ngày</SelectItem>
                      <SelectItem value="custom">Tùy chọn</SelectItem>
                    </SelectContent>
                  </Select>
                  {dateRange === 'custom' && (
                    <div className="flex gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="startDate" className="text-xs">Từ ngày</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="endDate" className="text-xs">Đến ngày</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {chartLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : chartData.length === 0 ? (
                <Alert>
                  <AlertDescription>Không có dữ liệu cho khoảng thời gian đã chọn</AlertDescription>
                </Alert>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="dateLabel" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      formatter={(value) => formatPrice(value)}
                      labelFormatter={(label) => `Ngày: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#ec4899" 
                      strokeWidth={2}
                      name="Doanh thu"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="bg-primary-light border-b">
              <CardTitle className="text-primary">Đơn hàng gần đây</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentOrders.length === 0 ? (
                <Alert>
                  <AlertDescription>Chưa có đơn hàng nào</AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Ngày đặt</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">#{order._id.slice(-8)}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell className="font-semibold">{formatPrice(order.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {ORDER_STATUS_LABELS[order.status] || order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/orders/${order._id}`)}
                            >
                              <Eye size={16} className="mr-2" />
                              Xem
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
