import { useState } from 'react';
import { clearFilters } from '../store/slices/productSlice';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ProductFilter({ filters, categories, attributes, onFilterChange }) {
  const dispatch = useDispatch();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    // Convert "all" value to null to clear filter
    const filterValue = value === 'all' ? null : (value || null);
    const newFilters = { ...localFilters, [key]: filterValue };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      category: null,
      brand: null,
      gender: null,
      scentGroup: null,
      concentration: null,
      minPrice: null,
      maxPrice: null
    };
    setLocalFilters(clearedFilters);
    dispatch(clearFilters());
    onFilterChange(clearedFilters);
  };

  return (
    <Card className="border-2 border-border shadow-sm">
      <CardHeader className="bg-primary border-b-2 border-primary/20">
        <CardTitle className="text-lg font-bold text-white">Bộ Lọc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6 bg-white">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Danh mục</Label>
          <Select
            value={localFilters.category || 'all'}
            onValueChange={(value) => handleChange('category', value)}
          >
            <SelectTrigger className="w-full border-2 border-border focus:border-primary">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Thương hiệu</Label>
          <Select
            value={localFilters.brand || 'all'}
            onValueChange={(value) => handleChange('brand', value)}
          >
            <SelectTrigger className="w-full border-2 border-border focus:border-primary">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {attributes.brand?.map((attr) => (
                <SelectItem key={attr._id} value={attr._id}>
                  {attr.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gender Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Giới tính</Label>
          <Select
            value={localFilters.gender || 'all'}
            onValueChange={(value) => handleChange('gender', value)}
          >
            <SelectTrigger className="w-full border-2 border-border focus:border-primary">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {attributes.gender?.map((attr) => (
                <SelectItem key={attr._id} value={attr._id}>
                  {attr.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Scent Group Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Nhóm hương</Label>
          <Select
            value={localFilters.scentGroup || 'all'}
            onValueChange={(value) => handleChange('scentGroup', value)}
          >
            <SelectTrigger className="w-full border-2 border-border focus:border-primary">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {attributes.scentGroup?.map((attr) => (
                <SelectItem key={attr._id} value={attr._id}>
                  {attr.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Concentration Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Nồng độ</Label>
          <Select
            value={localFilters.concentration || 'all'}
            onValueChange={(value) => handleChange('concentration', value)}
          >
            <SelectTrigger className="w-full border-2 border-border focus:border-primary">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {attributes.concentration?.map((attr) => (
                <SelectItem key={attr._id} value={attr._id}>
                  {attr.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Giá (VNĐ)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Từ"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="border-2 border-border focus:border-primary"
            />
            <Input
              type="number"
              placeholder="Đến"
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="border-2 border-border focus:border-primary"
            />
          </div>
        </div>

        <Button variant="outline" className="w-full border-2 font-semibold hover:bg-primary hover:text-white hover:border-primary transition-colors" onClick={handleClear}>
          Xóa Bộ Lọc
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductFilter;

