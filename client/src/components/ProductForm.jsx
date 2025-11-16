import { useState, useEffect } from 'react';
import api from '../utils/api';
import { uploadImage } from '../utils/uploadImage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, Upload, Loader2 } from 'lucide-react';

function ProductForm({ product, categories, attributes, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    attributes: {
      brand: '',
      gender: '',
      origin: '',
      concentration: '',
      perfumer: '',
      scentGroup: '',
      style: ''
    },
    variants: [{ volume: '', price: 0 }],
    images: []
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || product.category || '',
        attributes: {
          brand: product.attributes?.brand?._id || product.attributes?.brand || '',
          gender: product.attributes?.gender?._id || product.attributes?.gender || '',
          origin: product.attributes?.origin?._id || product.attributes?.origin || '',
          concentration: product.attributes?.concentration?._id || product.attributes?.concentration || '',
          perfumer: product.attributes?.perfumer?._id || product.attributes?.perfumer || '',
          scentGroup: product.attributes?.scentGroup?._id || product.attributes?.scentGroup || '',
          style: product.attributes?.style || ''
        },
        variants: product.variants?.length > 0 ? product.variants : [{ volume: '', price: 0 }],
        images: product.images || []
      });
    }
  }, [product]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      setError('');
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        return uploadImage(formData);
      });
      const results = await Promise.all(uploadPromises);
      const urls = results.map(res => res.data.secure_url);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));
    } catch (error) {
      setError('Lỗi upload ảnh: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      const data = {
        ...formData,
        attributes: {
          ...formData.attributes,
          brand: formData.attributes.brand || undefined,
          gender: formData.attributes.gender || undefined,
          origin: formData.attributes.origin || undefined,
          concentration: formData.attributes.concentration || undefined,
          perfumer: formData.attributes.perfumer || undefined,
          scentGroup: formData.attributes.scentGroup || undefined,
          style: formData.attributes.style || undefined
        }
      };

      if (product) {
        await api.put(`/products/${product._id}`, data);
      } else {
        await api.post('/products', data);
      }
      onSave();
    } catch (error) {
      setError(error.response?.data?.error || 'Lỗi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { volume: '', price: 0 }]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: field === 'price' ? (parseFloat(value) || 0) : value
    };
    setFormData({ ...formData, variants: newVariants });
  };

  return (
    <Card>
      <CardHeader className="bg-primary-light border-b">
        <CardTitle className="text-primary">
          {product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Tên sản phẩm *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả sản phẩm"
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Danh mục *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Thương hiệu</Label>
              <Select
                value={formData.attributes.brand || 'none'}
                onValueChange={(value) => setFormData({
                  ...formData,
                  attributes: { ...formData.attributes, brand: value === 'none' ? '' : value }
                })}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Chọn thương hiệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {attributes.brand?.map(attr => (
                    <SelectItem key={attr._id} value={attr._id}>{attr.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                value={formData.attributes.gender || 'none'}
                onValueChange={(value) => setFormData({
                  ...formData,
                  attributes: { ...formData.attributes, gender: value === 'none' ? '' : value }
                })}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {attributes.gender?.map(attr => (
                    <SelectItem key={attr._id} value={attr._id}>{attr.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Xuất xứ</Label>
              <Select
                value={formData.attributes.origin || 'none'}
                onValueChange={(value) => setFormData({
                  ...formData,
                  attributes: { ...formData.attributes, origin: value === 'none' ? '' : value }
                })}
              >
                <SelectTrigger id="origin">
                  <SelectValue placeholder="Chọn xuất xứ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {attributes.origin?.map(attr => (
                    <SelectItem key={attr._id} value={attr._id}>{attr.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="concentration">Nồng độ</Label>
              <Select
                value={formData.attributes.concentration || 'none'}
                onValueChange={(value) => setFormData({
                  ...formData,
                  attributes: { ...formData.attributes, concentration: value === 'none' ? '' : value }
                })}
              >
                <SelectTrigger id="concentration">
                  <SelectValue placeholder="Chọn nồng độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {attributes.concentration?.map(attr => (
                    <SelectItem key={attr._id} value={attr._id}>{attr.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="perfumer">Nhà pha chế</Label>
              <Select
                value={formData.attributes.perfumer || 'none'}
                onValueChange={(value) => setFormData({
                  ...formData,
                  attributes: { ...formData.attributes, perfumer: value === 'none' ? '' : value }
                })}
              >
                <SelectTrigger id="perfumer">
                  <SelectValue placeholder="Chọn nhà pha chế" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {attributes.perfumer?.map(attr => (
                    <SelectItem key={attr._id} value={attr._id}>{attr.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scentGroup">Nhóm hương</Label>
              <Select
                value={formData.attributes.scentGroup || 'none'}
                onValueChange={(value) => setFormData({
                  ...formData,
                  attributes: { ...formData.attributes, scentGroup: value === 'none' ? '' : value }
                })}
              >
                <SelectTrigger id="scentGroup">
                  <SelectValue placeholder="Chọn nhóm hương" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {attributes.scentGroup?.map(attr => (
                    <SelectItem key={attr._id} value={attr._id}>{attr.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Phong cách</Label>
            <Input
              id="style"
              type="text"
              value={formData.attributes.style}
              onChange={(e) => setFormData({
                ...formData,
                attributes: { ...formData.attributes, style: e.target.value }
              })}
              placeholder="Nhập phong cách"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Ảnh sản phẩm</Label>
            <div className="flex items-center gap-2">
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
            </div>
            {uploading && <p className="text-sm text-muted-foreground">Đang upload...</p>}
            
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Biến thể (dung tích, giá)</Label>
            {formData.variants.map((variant, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Input
                    type="text"
                    placeholder="Dung tích (e.g. 100ml)"
                    value={variant.volume}
                    onChange={(e) => updateVariant(index, 'volume', e.target.value)}
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    type="number"
                    placeholder="Giá"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeVariant(index)}
                    disabled={formData.variants.length === 1}
                    className="w-full"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
            >
              <Plus size={16} className="mr-2" />
              Thêm biến thể
            </Button>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X size={16} className="mr-2" />
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ProductForm;
