# Quick Setup Guide

## Để chạy các tính năng mới, hãy làm theo các bước sau:

### Step 1: Cập nhật Database Schema
```bash
cd backend
npx prisma migrate dev --name "add_password_reset_and_notification_system"
```

### Step 2: Cài đặt Dependencies (nếu chưa có)
Đảm bảo các package sau đã được cài đặt:
```bash
npm install crypto bcryptjs
```

### Step 3: Khởi động Server
```bash
# Backend
cd backend
npm start

# Frontend (in a new terminal)
cd frontend
npm run dev
```

### Step 4: Test các Endpoint mới

#### A. Test Hủy Đăng Ký Hoạt động
```bash
curl -X POST http://localhost:5000/api/volunteer/unregister-event/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### B. Test Xem Chi Tiết Hoạt động
```bash
curl http://localhost:5000/api/events/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### C. Test Quên Mật Khẩu
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"volunteer@example.com"}'
```

#### D. Test Đặt Lại Mật Khẩu
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_FROM_FORGOT_PASSWORD","newPassword":"newpass123"}'
```

#### E. Test Gửi Thông Báo (Admin)
```bash
curl -X POST http://localhost:5000/api/notifications/event/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Hoạt động sắp bắt đầu",
    "content":"Hoạt động sẽ bắt đầu vào ngày mai",
    "type":"EVENT"
  }'
```

### Step 5: Cập nhật Frontend (Tuỳ chọn)

Thêm các component sau vào frontend:

1. **Forgot Password Page** - `frontend/src/pages/ForgotPassword.jsx`
2. **Reset Password Page** - `frontend/src/pages/ResetPassword.jsx`
3. **Notifications Dropdown** - `frontend/src/components/NotificationsDropdown.jsx`
4. **Unregister Button** - Thêm vào event detail/registered events pages
5. **Default Avatar** - Tạo file `/public/default-avatar.png`

---

## Các Tính Năng Đã Triển Khai

### ✅ Phần Tình Nguyện Viên:
1. **Hủy đăng ký hoạt động** - POST `/api/volunteer/unregister-event/:id`
2. **Xem chi tiết hoạt động** - GET `/api/events/:id`
3. **Xem thông tin hoạt động đã đăng ký** - GET `/api/volunteer/:id/events`
4. **Avatar từ upload, không random** - Tất cả random avatar đã được loại bỏ

### ✅ Quên Mật Khẩu:
1. **Gửi yêu cầu đặt lại mật khẩu** - POST `/api/auth/forgot-password`
2. **Đặt lại mật khẩu** - POST `/api/auth/reset-password`
3. **Token hết hạn sau 24 giờ** - Tự động xóa sau khi sử dụng

### ✅ Hệ Thống Thông Báo:
1. **Gửi thông báo cho volunteers trong hoạt động** - POST `/api/notifications/event/:eventId` (ADMIN)
2. **Gửi thông báo chung** - POST `/api/notifications/broadcast` (ADMIN)
3. **Đánh dấu thông báo là đã đọc** - PUT `/api/notifications/:id/read`
4. **Xóa thông báo** - DELETE `/api/notifications/:id`
5. **Đếm thông báo chưa đọc** - GET `/api/notifications/count`

---

## Lưu ý Quan Trọng

1. **Email Notifications (TODO)**
   - Hiện tại chưa cài đặt tính năng gửi email
   - Cần cài đặt nodemailer hoặc SendGrid
   - Xem `IMPLEMENTATION_GUIDE.md` cho hướng dẫn chi tiết

2. **Default Avatar**
   - Hãy tạo file `/public/default-avatar.png` hoặc thay thế URL trong code
   - Hoặc sử dụng placeholder service khác

3. **Environment Variables**
   - Không có thay đổi nào cần thiết cho `.env`
   - Vẫn sử dụng `DATABASE_URL` hiện tại

4. **Token trong Forgot Password**
   - Hiện tại API trả về token (để test)
   - **Trong production, hãy loại bỏ dòng này và gửi link qua email**

---

## Khắc Phục Sự Cố

**Lỗi Migration:**
```bash
# Nếu migration bị lỗi, reset database:
npx prisma migrate reset
```

**Lỗi Type:**
```bash
# Cập nhật Prisma Client:
npx prisma generate
```

**Route Not Found:**
- Đảm bảo file `notification.routes.js` đã được tạo
- Đảm bảo `server.js` đã import notification routes

---

## Tiếp Theo

Xem `IMPLEMENTATION_GUIDE.md` cho:
- Hướng dẫn chi tiết toàn bộ API
- Cách thực hiện email notifications
- Testing instructions
- Frontend integration guide
