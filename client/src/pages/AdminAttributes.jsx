import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminSidebar from '../components/AdminSidebar';
import api from '../utils/api';
import { ATTRIBUTE_TYPES } from '../utils/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, X } from 'lucide-react';

function AdminAttributes() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [attributes, setAttributes] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('brand');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: 'brand', value: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadAttributes();
  }, [user, navigate, selectedType]);

  const loadAttributes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/attributes?type=${selectedType}`);
      setAttributes(prev => ({ ...prev, [selectedType]: response.data }));
    } catch (error) {
      console.error('Error loading attributes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/attributes/${editingId}`, formData);
      } else {
        await api.post('/attributes', formData);
      }
      setShowForm(false);
      setFormData({ type: selectedType, value: '' });
      setEditingId(null);
      loadAttributes();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi lưu thuộc tính');
    }
  };

  const handleEdit = (attr) => {
    setFormData({ type: attr.type, value: attr.value });
    setEditingId(attr._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa thuộc tính này?')) return;
    try {
      await api.delete(`/attributes/${id}`);
      loadAttributes();
    } catch (error) {
      alert(error.response?.data?.error || 'Lỗi xóa thuộc tính');
    }
  };

  const typeLabels = {
    brand: 'Thương hiệu',
    gender: 'Giới tính',
    origin: 'Xuất xứ',
    concentration: 'Nồng độ',
    perfumer: 'Nhà pha chế',
    scentGroup: 'Nhóm hương'
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
            <h2 className="text-2xl font-bold text-primary">Quản lý Thuộc tính</h2>
            <Button
              onClick={() => {
                setFormData({ type: selectedType, value: '' });
                setEditingId(null);
                setShowForm(true);
              }}
            >
              <Plus size={18} className="mr-2" />
              Thêm thuộc tính
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loại thuộc tính</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Label>Chọn loại thuộc tính:</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value);
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {showForm && (
            <Card>
              <CardHeader className="bg-primary-light border-b">
                <CardTitle className="text-primary">
                  {editingId ? 'Sửa thuộc tính' : 'Thêm thuộc tính'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Giá trị *</Label>
                    <Input
                      id="value"
                      type="text"
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">
                      Lưu
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setFormData({ type: selectedType, value: '' });
                        setEditingId(null);
                      }}
                    >
                      <X size={16} className="mr-2" />
                      Hủy
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{typeLabels[selectedType]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Giá trị</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attributes[selectedType]?.map((attr) => (
                      <TableRow key={attr._id}>
                        <TableCell className="font-medium">{attr.value}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(attr)}
                            >
                              <Edit size={16} className="mr-1" />
                              Sửa
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(attr._id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 size={16} className="mr-1" />
                              Xóa
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminAttributes;
