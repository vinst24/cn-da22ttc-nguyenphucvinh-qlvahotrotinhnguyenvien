# Volunteer Management System - Feature Implementation Guide

## Overview
This document provides a comprehensive guide to the features implemented for the volunteer management system, specifically focusing on volunteer-related functionality.

---

## Implemented Features

### 1. ✅ Cancel Event Registration (Unregister from Activity)
**Description**: Allow volunteers to cancel their registration for an event they previously joined.

**Endpoint**: `POST /api/volunteer/unregister-event/:id`
- **Authentication**: Required (Volunteer must be logged in)
- **Parameters**: Event ID
- **Response**: Success message when volunteer is unregistered

**Backend Changes**:
- New controller function `unregisterEvent()` in `volunteer.controller.js`
- Uses database transaction to ensure atomicity
- Deletes join record and decrements `currentParticipants`

**Frontend Changes**: 
- Frontend can call this endpoint to allow volunteers to cancel registrations
- UI button/option should be added to event detail or registered events pages

---

### 2. ✅ Event Details for Volunteers
**Description**: Volunteers can view detailed information about available and registered events.

**Endpoint**: `GET /api/events/:id`
- **Authentication**: Optional (shows registration status if logged in)
- **Response**: Complete event details including:
  - Title, description, image
  - Start/end dates, address
  - Participant count vs max volunteers
  - Organization name
  - Province/commune information
  - Current user's registration status

**Backend Changes**:
- New controller function `getEventDetail()` in `volunteer.controller.js`
- Available events endpoint now returns: `description`, `maxVolunteers`, `currentParticipants`, `endDate`
- Registered events endpoint now returns: `description`, `maxVolunteers`, `currentParticipants`, `endDate`, `organizationName`

**Data Returned**:
```javascript
{
  event: {
    id, title, description, image,
    address, startDate, endDate,
    status, isApproved,
    maxVolunteers, currentParticipants,
    organizationId, organizationName,
    communeName, provinceName,
    isRegistered
  }
}
```

---

### 3. ✅ Max Volunteers Validation
**Description**: Prevent volunteers from registering for events that have reached maximum capacity.

**Implementation**:
- `registerEvent()` function now checks: `if (maxVolunteers > 0 && currentParticipants >= maxVolunteers)`
- Only validates when `maxVolunteers > 0` (0 means unlimited)
- Returns error: "Sự kiện đã đủ người"

---

### 4. ✅ User-Uploaded Avatars (No Random Avatars)
**Description**: Use only user-uploaded avatars, removing all random avatar placeholders.

**Changes Made**:
1. **Backend**: `uploadAvatar()` endpoint saves actual file paths
2. **Frontend**: Replaced all `https://i.pravatar.cc/` URLs with `/default-avatar.png`
   - VolunteerProfile.jsx
   - OrgVolunteers.jsx
   - OrgSettings.jsx
   - AdminSettings.jsx
   - Topbar.jsx

**Note**: A default avatar image should be created at `/public/default-avatar.png`

---

### 5. ✅ Forgot Password Functionality
**Description**: Allow users to reset their password when forgotten.

**Database Schema**:
- New table: `PASSWORD_RESET`
- Fields: id, userId, token, expiresAt, createdAt

**Endpoints**:
1. `POST /api/auth/forgot-password`
   - Input: `{ email }`
   - Generates 32-byte random token
   - Stores in database with 24-hour expiration
   - Returns token (for testing; remove in production)
   - **TODO**: Send email to admin and user with reset link

2. `POST /api/auth/reset-password`
   - Input: `{ token, newPassword }`
   - Validates token existence and expiration
   - Validates password length (minimum 6 characters)
   - Updates volunteer password (hashed)
   - Deletes reset token after use

**Security Features**:
- Tokens are single-use and expire after 24 hours
- Email existence is not revealed (for privacy)
- Passwords are hashed with bcrypt
- Token is random and cryptographically secure

---

### 6. ✅ Event Notification System
**Description**: Send notifications to volunteers about event updates.

**New Endpoints**:

#### Admin Endpoints:
1. `POST /api/notifications/event/:eventId`
   - Send notification to all volunteers in a specific event
   - Input: `{ title, content, type }`
   - Response: Notification ID and number of recipients

2. `POST /api/notifications/broadcast`
   - Send notification to all active volunteers
   - Input: `{ title, content, type }`
   - Response: Notification ID and number of recipients

#### User Endpoints:
1. `PUT /api/notifications/:notificationId/read`
   - Mark notification as read

2. `DELETE /api/notifications/:notificationId`
   - Delete notification from user's view

3. `GET /api/notifications/count`
   - Get count of unread notifications for current user

**Database Changes**:
- Modified `Notification` model to make `eventId` optional (`Int?`)
- Allows system notifications not tied to specific events

**Sample Usage**:
```javascript
// Send notification when event status changes
POST /api/notifications/event/5
{
  "title": "Hoạt động sắp bắt đầu",
  "content": "Hoạt động 'Dọn dẹp công viên' sẽ bắt đầu vào ngày mai lúc 9:00 AM",
  "type": "EVENT"
}

// Broadcast system announcement
POST /api/notifications/broadcast
{
  "title": "Thông báo hệ thống",
  "content": "Hệ thống sẽ bảo trì vào thứ 3 tới",
  "type": "SYSTEM"
}
```

---

## Database Schema Changes

### New Tables:
```prisma
model PasswordReset {
  id        Int       @id @default(autoincrement())
  userId    Int
  token     String    @unique
  expiresAt DateTime
  createdAt DateTime  @default(now())
}
```

### Modified Tables:
- `Notification`: Changed `eventId` from `Int` to `Int?` (optional)

---

## API Routes Summary

### Authentication Routes
- `POST /api/auth/register` - Register new volunteer
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token

### Volunteer Routes
- `GET /api/volunteer/available` - Get available events (authenticated)
- `POST /api/volunteer/register-event/:id` - Register for event
- `POST /api/volunteer/unregister-event/:id` - Unregister from event
- `GET /api/volunteer/:id/events` - Get registered events
- `GET /api/volunteer/:id/notifications` - Get notifications
- `GET /api/volunteer/:id` - Get profile
- `PUT /api/volunteer/:id` - Update profile
- `POST /api/volunteer/:id/avatar` - Upload avatar
- `PUT /api/volunteer/:id/change-password` - Change password

### Event Routes
- `GET /api/events/:id` - Get event details (public)
- `POST /api/events/:id/join` - Join event (shorthand for register-event)

### Notification Routes
- `POST /api/notifications/event/:eventId` - Send event notification (ADMIN)
- `POST /api/notifications/broadcast` - Broadcast notification (ADMIN)
- `PUT /api/notifications/:notificationId/read` - Mark as read
- `DELETE /api/notifications/:notificationId` - Delete notification
- `GET /api/notifications/count` - Get unread count

---

## Testing Instructions

### 1. Test Cancel Registration
```bash
# Request
POST /api/volunteer/unregister-event/5
Authorization: Bearer <token>

# Expected Response
{
  "message": "Hủy đăng ký sự kiện thành công"
}
```

### 2. Test Event Details
```bash
# Request
GET /api/events/5
Authorization: Bearer <token>

# Expected Response
{
  "event": {
    "id": 5,
    "title": "Dọn dẹp công viên",
    "description": "...",
    "currentParticipants": 10,
    "maxVolunteers": 20,
    "isRegistered": true
  }
}
```

### 3. Test Forgot Password
```bash
# Request
POST /api/auth/forgot-password
{
  "email": "volunteer@example.com"
}

# Expected Response
{
  "message": "Liên kết cấp lại mật khẩu đã được gửi đến email của bạn",
  "token": "abc123..." // Remove in production
}
```

### 4. Test Reset Password
```bash
# Request
POST /api/auth/reset-password
{
  "token": "abc123...",
  "newPassword": "newpass123"
}

# Expected Response
{
  "message": "Mật khẩu đã được cấp lại thành công"
}
```

### 5. Test Send Notification
```bash
# Request (ADMIN ONLY)
POST /api/notifications/event/5
Authorization: Bearer <admin_token>
{
  "title": "Hoạt động sắp bắt đầu",
  "content": "Hoạt động sẽ bắt đầu vào ngày mai",
  "type": "EVENT"
}

# Expected Response
{
  "message": "Đã gửi thông báo đến 15 volunteer",
  "notification": {
    "id": 1,
    "title": "Hoạt động sắp bắt đầu",
    "sentTo": 15
  }
}
```

---

## Next Steps & TODO

### Email Notifications (Priority: High)
- [ ] Implement email service (nodemailer/SendGrid)
- [ ] Send email when password reset requested
- [ ] Send email to admin when password reset requested
- [ ] Send email to volunteers when event notifications are sent

### Frontend Updates (Priority: High)
- [ ] Update EventDetail.jsx to display new event details
- [ ] Add unregister button to registered events
- [ ] Add notification badge/bell icon in Topbar
- [ ] Create notifications dropdown/page
- [ ] Add forgot password page with email input
- [ ] Add reset password page with token input

### Additional Features (Priority: Medium)
- [ ] Real-time notifications using WebSocket/Socket.io
- [ ] Notification preferences (which types to receive)
- [ ] Email digest/daily summary of notifications
- [ ] Notification history/archive
- [ ] SMS notifications for urgent announcements

### Security Enhancements (Priority: High)
- [ ] Implement rate limiting for password reset requests
- [ ] Add CAPTCHA to forgot password form
- [ ] Implement email verification for password reset links
- [ ] Add audit logging for sensitive operations

---

## File Changes Summary

### Backend Files Modified:
1. `backend/prisma/schema.prisma` - Added PasswordReset model, modified Notification.eventId to optional
2. `backend/src/controllers/volunteer.controller.js` - Added unregisterEvent, getEventDetail, updated getAvailableEvents, getRegisteredEvents
3. `backend/src/controllers/auth.controller.js` - Added forgotPasswordController, resetPasswordController
4. `backend/src/controllers/notification.controller.js` - NEW FILE - Notification management
5. `backend/src/routes/volunteer.routes.js` - Added unregister-event route
6. `backend/src/routes/auth.routes.js` - Added forgot-password and reset-password routes
7. `backend/src/routes/event.route.js` - Added GET /events/:id route
8. `backend/src/routes/notification.routes.js` - NEW FILE - Notification routes
9. `backend/server.js` - Added event and notification route imports

### Frontend Files Modified:
1. `frontend/src/pages/volunteer/VolunteerProfile.jsx` - Removed pravatar.cc
2. `frontend/src/pages/organization/OrgVolunteers.jsx` - Removed pravatar.cc
3. `frontend/src/pages/organization/OrgSettings.jsx` - Removed pravatar.cc
4. `frontend/src/pages/admin/AdminSettings.jsx` - Removed pravatar.cc
5. `frontend/src/components/Topbar.jsx` - Removed pravatar.cc

---

## Deployment Checklist

- [ ] Create Prisma migration: `npx prisma migrate dev --name "add_password_reset_and_notifications"`
- [ ] Deploy backend changes
- [ ] Update frontend with new endpoints
- [ ] Configure email service (if implementing email)
- [ ] Test all new endpoints in staging
- [ ] Create public/default-avatar.png if not exists
- [ ] Update API documentation
- [ ] Create user guide for password reset feature
- [ ] Monitor error logs after deployment

---

## Support & Questions

For detailed implementation of email notifications, refer to:
- Nodemailer: https://nodemailer.com/
- SendGrid: https://sendgrid.com/
- Twilio: https://www.twilio.com/ (for SMS)
