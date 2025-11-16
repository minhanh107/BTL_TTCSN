# Web Scraper cho Thế Giới Nước Hoa

Script này crawl dữ liệu sản phẩm từ website thegioinuochoa.com.vn và xuất ra JSON phù hợp với model Product.

## Cài đặt

Các dependencies cần thiết đã được cài đặt:
- `axios`: Để fetch HTML từ website
- `cheerio`: Để parse và extract dữ liệu từ HTML

## Cách sử dụng

### Chạy scraper cho tất cả các danh mục:

```bash
npm run scrape
```

Hoặc:

```bash
node scripts/scraper.js
```

### Các danh mục được crawl:

1. **Nước hoa Nam**: `https://www.thegioinuochoa.com.vn/nuoc-hoa-nam`
2. **Nước hoa Nữ**: `https://www.thegioinuochoa.com.vn/nuoc-hoa-nu`
3. **Nước hoa Unisex**: `https://www.thegioinuochoa.com.vn/nuoc-hoa-unisex`
4. **Nước hoa Niche**: `https://www.thegioinuochoa.com.vn/nuoc-hoa-niche`

## Cấu trúc dữ liệu output

Script sẽ tạo các file JSON:

1. **`scraped_nuoc-hoa-nam.json`**: Sản phẩm từ danh mục Nam
2. **`scraped_nuoc-hoa-nu.json`**: Sản phẩm từ danh mục Nữ
3. **`scraped_nuoc-hoa-unisex.json`**: Sản phẩm từ danh mục Unisex
4. **`scraped_nuoc-hoa-niche.json`**: Sản phẩm từ danh mục Niche
5. **`scraped_all_products.json`**: Tất cả sản phẩm từ tất cả danh mục

### Format JSON output:

```json
{
  "name": "Nước hoa Creed Queen Of Silk EDP",
  "description": "Mô tả sản phẩm...",
  "categorySlug": "nuoc-hoa-nu",
  "attributes": {
    "brand": "Creed",
    "gender": "Nữ",
    "origin": "Pháp",
    "concentration": "Eau de parfum",
    "perfumer": "",
    "scentGroup": "Hương Hoa cỏ Phương đông - Oriental Floral",
    "style": "Sang trọng, quyền lực"
  },
  "variants": [
    {
      "volume": "100ML EDP",
      "price": 8690000,
      "stock": 0
    }
  ],
  "images": [
    "https://www.thegioinuochoa.com.vn/uploads/item_product/thumb1500x500/202410/20241030104544_374134.png"
  ],
  "isActive": true
}
```

## Lưu ý quan trọng

### Mapping dữ liệu với Database

JSON output chứa các giá trị string cho:
- **categorySlug**: Cần map với Category trong database (tìm hoặc tạo Category với slug tương ứng)
- **attributes**: Các giá trị string cần map với Attribute trong database:
  - `brand` → Attribute với type='brand'
  - `gender` → Attribute với type='gender'
  - `origin` → Attribute với type='origin'
  - `concentration` → Attribute với type='concentration'
  - `perfumer` → Attribute với type='perfumer'
  - `scentGroup` → Attribute với type='scentGroup'
  - `style` → String trực tiếp (không cần ObjectId)

### Import dữ liệu vào Database

Sau khi scrape xong, bạn có thể import dữ liệu vào MongoDB bằng script `importScrapedData.js`:

### Import tất cả sản phẩm:

```bash
npm run import:scraped
```

Hoặc chỉ định file cụ thể:

```bash
node scripts/importScrapedData.js scripts/scraped_all_products.json
```

### Import từng danh mục:

```bash
node scripts/importScrapedData.js scripts/scraped_nuoc-hoa-nam.json
node scripts/importScrapedData.js scripts/scraped_nuoc-hoa-nu.json
node scripts/importScrapedData.js scripts/scraped_nuoc-hoa-unisex.json
node scripts/importScrapedData.js scripts/scraped_nuoc-hoa-niche.json
```

### Script import sẽ tự động:

1. ✅ Tìm hoặc tạo Category dựa trên `categorySlug`
2. ✅ Tìm hoặc tạo Attribute cho mỗi thuộc tính (brand, gender, origin, concentration, perfumer, scentGroup)
3. ✅ Tạo Product với các ObjectId đã map
4. ✅ Bỏ qua các sản phẩm đã tồn tại (dựa trên tên)
5. ✅ Hiển thị thống kê import (thành công, bỏ qua, lỗi)

## Tùy chỉnh

### Thay đổi số trang tối đa:

Trong file `scraper.js`, tìm dòng:
```javascript
const products = await scrapeCategory(categorySlug, categoryUrl, 10);
```

Thay `10` bằng số trang bạn muốn crawl.

### Thay đổi delay giữa các request:

- Delay giữa các trang: `await delay(2000);` (2 giây)
- Delay giữa các sản phẩm: `await delay(3000);` (3 giây)
- Delay giữa các danh mục: `await delay(5000);` (5 giây)

## Xử lý lỗi

- Script sẽ tự động bỏ qua các sản phẩm thiếu dữ liệu bắt buộc (name, variants)
- Các lỗi khi fetch sẽ được log ra console
- Script sẽ tiếp tục chạy ngay cả khi một số sản phẩm bị lỗi

## Thời gian chạy

Với mỗi danh mục có khoảng 100 sản phẩm:
- Thời gian ước tính: ~5-10 phút/danh mục
- Tổng thời gian cho 4 danh mục: ~20-40 phút

Script có delay để tránh quá tải server, vì vậy thời gian có thể lâu hơn nếu có nhiều sản phẩm.

