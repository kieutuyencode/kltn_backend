# Yêu cầu

Trước khi chạy dự án, hãy đảm bảo bạn đã cài đặt các phần mềm sau:
- **Node.js** (khuyến nghị phiên bản 18.x trở lên)
- **npm** (khuyến nghị phiên bản 9.x trở lên)
- **MySQL** (khuyến nghị phiên bản 8.0.x)

# Cài đặt

## 1. Cài đặt phụ thuộc:
```
npm install
```

## 2. Cấu hình biến môi trường:
Tạo tệp `.env` trong thư mục gốc dự án và cấu hình các biến sau:

```
DB_USERNAME =
DB_PASSWORD =
DB_NAME =
DB_HOST =
DB_PORT =
```

## 3. Thiết lập cơ sở dữ liệu:
Cập nhật các giá trị trong `src/database/migrations/index.ts` để phù hợp với thiết lập cơ sở dữ liệu của bạn.

Tạo migration:
  ```
  npm run typeorm migration:generate src/database/migrations/resources/${tên_migration} -d src/database/migrations/index.ts
  ```
Chạy migration:
  ```
  npm run typeorm migration:run -d src/database/migrations/index.ts
  ```

# Chạy dự án

## Chế độ phát triển

Để khởi động dự án ở chế độ phát triển với tính năng hot-reloading:

```bash
npm run start:dev
```

## Chế độ sản xuất

### 1. Biên dịch dự án:

   ```bash
   npm run build
   ```
### 2. Khởi động server sản xuất:

   ```bash
   npm run start:prod
   ```
