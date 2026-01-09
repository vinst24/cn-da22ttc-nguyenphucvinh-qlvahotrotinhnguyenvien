# API Endpoints Reference

## Tất cả các endpoint mới/cập nhật

### Authentication Endpoints
- **POST** `/api/auth/register` - Đăng ký tài khoản mới
- **POST** `/api/auth/login` - Đăng nhập
- **POST** `/api/auth/forgot-password` - Yêu cầu cấp lại mật khẩu
- **POST** `/api/auth/reset-password` - Đặt lại mật khẩu
- **POST** `/api/auth/logout` - Đăng xuất
- **POST** `/api/auth/refresh` - Làm mới access token
- **GET** `/api/auth/verify-token` - Kiểm tra token

---

### Volunteer Endpoints

#### Events Management
- **GET** `/api/volunteer/available` - Lấy danh sách hoạt động khả dụng (new: now includes description, endDate, maxVolunteers, currentParticipants)
- **POST** `/api/volunteer/register-event/:id` - Đăng ký tham gia hoạt động
- **POST** `/api/volunteer/unregister-event/:id` - **[NEW]** Hủy đăng ký hoạt động
- **GET** `/api/volunteer/:id/events` - Lấy danh sách hoạt động đã đăng ký (new: includes full event details)

#### Profile Management
- **GET** `/api/volunteer/:id` - Lấy thông tin cá nhân
- **PUT** `/api/volunteer/:id` - Cập nhật thông tin cá nhân
- **POST** `/api/volunteer/:id/avatar` - Upload ảnh đại diện
- **PUT** `/api/volunteer/:id/change-password` - Đổi mật khẩu

#### Notifications
- **GET** `/api/volunteer/:id/notifications` - Lấy danh sách thông báo

---

### Event Endpoints
- **GET** `/api/events/:id` - **[NEW]** Lấy chi tiết hoạt động (public endpoint)
  - Available with or without authentication
  - Shows user's registration status if logged in

---

### Notification Endpoints

#### Admin Only
- **POST** `/api/notifications/event/:eventId` - **[NEW]** Gửi thông báo cho volunteers trong hoạt động
  - Requires: ADMIN role
  - Body: `{ title, content, type }`
  
- **POST** `/api/notifications/broadcast` - **[NEW]** Gửi thông báo cho tất cả volunteers
  - Requires: ADMIN role
  - Body: `{ title, content, type }`

#### User
- **PUT** `/api/notifications/:notificationId/read` - **[NEW]** Đánh dấu thông báo là đã đọc
- **DELETE** `/api/notifications/:notificationId` - **[NEW]** Xóa thông báo
- **GET** `/api/notifications/count` - **[NEW]** Lấy số thông báo chưa đọc

---

### Organization Endpoints
- **GET** `/api/organization/:id` - Lấy thông tin tổ chức
- **PUT** `/api/organization/:id` - Cập nhật thông tin tổ chức (ADMIN)
- **GET** `/api/organization/events` - Lấy danh sách hoạt động của tổ chức (ORG)
- **POST** `/api/organization/events` - Tạo hoạt động mới (ORG)
- **GET** `/api/organization/events/:id` - Lấy chi tiết hoạt động (ORG)
- **PUT** `/api/organization/events/:id` - Cập nhật hoạt động (ORG)
- **DELETE** `/api/organization/events/:id` - Xóa hoạt động (ORG)
- **GET** `/api/organization/events/:id/participants` - Lấy danh sách participants (ORG)

---

### Admin Endpoints
- **GET** `/api/admin/volunteers` - Lấy danh sách volunteers
- **GET** `/api/admin/volunteer/:id` - Lấy chi tiết volunteer
- **PUT** `/api/admin/volunteer/:id` - Cập nhật thông tin volunteer
- **PUT** `/api/admin/volunteer/:id/toggle-active` - Bật/tắt volunteer
- **GET** `/api/admin/organizations` - Lấy danh sách tổ chức
- **POST** `/api/admin/organizations` - Tạo tổ chức mới
- **GET** `/api/admin/organization/:id` - Lấy chi tiết tổ chức
- **PUT** `/api/admin/organization/:id` - Cập nhật tổ chức
- **DELETE** `/api/admin/organization/:id` - Xóa tổ chức
- **POST** `/api/admin/organization/:id/accounts` - Thêm account cho tổ chức
- **DELETE** `/api/admin/account/:id` - Xóa account
- **GET** `/api/admin/events` - Lấy danh sách hoạt động
- **PUT** `/api/admin/events/:id/approve` - Duyệt hoạt động
- **GET** `/api/admin/statistics` - Lấy thống kê
- **GET** `/api/admin/action-stats` - Lấy action stats
- **GET** `/api/admin/recent-events` - Lấy hoạt động gần đây
- **GET** `/api/admin/events-by-month` - Lấy hoạt động theo tháng

---

### Location Endpoints
- **GET** `/api/locations/provinces` - Lấy danh sách tỉnh
- **GET** `/api/locations/provinces/:id/communes` - Lấy danh sách xã/phường

---

### Country Endpoints
- **GET** `/api/countries` - Lấy danh sách quốc gia

---

## Request/Response Examples

### 1. Hủy đăng ký hoạt động
```bash
POST /api/volunteer/unregister-event/5
Authorization: Bearer <token>
Content-Type: application/json

# Response
{
  "message": "Hủy đăng ký sự kiện thành công"
}
```

### 2. Xem chi tiết hoạt động
```bash
GET /api/events/5
Authorization: Bearer <token>

# Response
{
  "event": {
    "id": 5,
    "title": "Dọn dẹp công viên",
    "description": "Tham gia với chúng tôi...",
    "image": "/images/event5.jpg",
    "address": "Công viên Tao Đàn, Quận 1",
    "startDate": "2026-01-15T09:00:00.000Z",
    "endDate": "2026-01-15T12:00:00.000Z",
    "status": "UPCOMING",
    "isApproved": true,
    "maxVolunteers": 50,
    "currentParticipants": 30,
    "organizationId": 2,
    "organizationName": "Tổ chức A",
    "communeName": "Phường Bến Nghé",
    "provinceName": "TP. Hồ Chí Minh",
    "isRegistered": true
  }
}
```

### 3. Hoạt động khả dụng (cập nhật)
```bash
GET /api/volunteer/available
Authorization: Bearer <token>

# Response
{
  "events": [
    {
      "id": 5,
      "title": "Dọn dẹp công viên",
      "description": "Tham gia...",
      "startDate": "2026-01-15T09:00:00.000Z",
      "endDate": "2026-01-15T12:00:00.000Z",
      "address": "Công viên Tao Đàn",
      "maxVolunteers": 50,
      "currentParticipants": 30,
      "status": "UPCOMING",
      "organizationId": 2,
      "organizationName": "Tổ chức A",
      "isRegistered": false
    }
  ]
}
```

### 4. Quên mật khẩu
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "volunteer@example.com"
}

# Response
{
  "message": "Liên kết cấp lại mật khẩu đã được gửi đến email của bạn",
  "token": "abc123xyz789..." // Remove in production
}
```

### 5. Đặt lại mật khẩu
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123xyz789...",
  "newPassword": "newpassword123"
}

# Response
{
  "message": "Mật khẩu đã được cấp lại thành công"
}
```

### 6. Gửi thông báo hoạt động (Admin)
```bash
POST /api/notifications/event/5
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Hoạt động sắp bắt đầu",
  "content": "Hoạt động 'Dọn dẹp công viên' sẽ bắt đầu vào ngày mai lúc 9:00 AM",
  "type": "EVENT"
}

# Response
{
  "message": "Đã gửi thông báo đến 25 volunteer",
  "notification": {
    "id": 1,
    "title": "Hoạt động sắp bắt đầu",
    "content": "Hoạt động 'Dọn dẹp công viên'...",
    "type": "EVENT",
    "sentTo": 25
  }
}
```

### 7. Gửi thông báo chung (Admin)
```bash
POST /api/notifications/broadcast
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Thông báo hệ thống",
  "content": "Hệ thống sẽ bảo trì vào thứ 3 tới từ 2AM - 5AM",
  "type": "SYSTEM"
}

# Response
{
  "message": "Đã gửi thông báo tới 150 volunteer",
  "notification": {
    "id": 2,
    "title": "Thông báo hệ thống",
    "content": "Hệ thống sẽ bảo trì...",
    "type": "SYSTEM",
    "sentTo": 150
  }
}
```

### 8. Đánh dấu thông báo là đã đọc
```bash
PUT /api/notifications/5/read
Authorization: Bearer <token>

# Response
{
  "message": "Đã đánh dấu là đã đọc",
  "notificationUser": {
    "userId": 1,
    "notificationId": 5,
    "isRead": true
  }
}
```

### 9. Xóa thông báo
```bash
DELETE /api/notifications/5
Authorization: Bearer <token>

# Response
{
  "message": "Đã xóa thông báo"
}
```

### 10. Lấy số thông báo chưa đọc
```bash
GET /api/notifications/count
Authorization: Bearer <token>

# Response
{
  "unreadCount": 5
}
```

---

## Error Responses

### Invalid Token
```json
{
  "message": "Unauthorized"
}
```

### Event Not Found
```json
{
  "message": "Hoạt động không tồn tại"
}
```

### Event Full
```json
{
  "message": "Sự kiện đã đủ người"
}
```

### Already Registered
```json
{
  "message": "Đã đăng ký sự kiện này"
}
```

### Not Registered
```json
{
  "message": "Bạn chưa đăng ký sự kiện này"
}
```

### Invalid Password Reset Token
```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

### Token Expired
```json
{
  "message": "Token đã hết hạn"
}
```

---

## Authentication

Tất cả các endpoint (trừ public endpoints) yêu cầu header:
```
Authorization: Bearer <access_token>
```

### Public Endpoints (không yêu cầu auth):
- `GET /api/events/:id` - Có thể truy cập mà không cần token, nhưng sẽ hiển thị `isRegistered: false` nếu chưa login

---

## Rate Limiting & Security

Lưu ý: Hiện tại chưa có rate limiting. Trong production nên thêm:
- Rate limiting cho password reset endpoint
- CAPTCHA cho forgot password
- Email verification cho reset links
