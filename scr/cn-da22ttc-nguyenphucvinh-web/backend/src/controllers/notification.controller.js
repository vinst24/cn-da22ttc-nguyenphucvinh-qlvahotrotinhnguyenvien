import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Send notification to all volunteers who joined an event
 * Admin endpoint: POST /notifications/event/:eventId
 */
export const notifyEventVolunteers = async (req, res) => {
  try {
    const { title, content, type = "EVENT" } = req.body;
    const eventId = parseInt(req.params.eventId);

    if (!eventId || !title || !content) {
      return res.status(400).json({ 
        message: "Event ID, title, và content là bắt buộc" 
      });
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ message: "Hoạt động không tồn tại" });
    }

    // Get all volunteers who joined this event
    const joins = await prisma.join.findMany({
      where: { eventId: eventId },
      select: { userId: true }
    });

    if (joins.length === 0) {
      return res.status(200).json({ 
        message: "Không có volunteer nào trong sự kiện này" 
      });
    }

    const userIds = joins.map(j => j.userId);

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        eventId: eventId,
        title,
        content,
        type
      }
    });

    // Create notification for each volunteer
    const notificationUsers = userIds.map(userId => ({
      userId,
      notificationId: notification.id,
      isRead: false
    }));

    await prisma.notificationUser.createMany({
      data: notificationUsers
    });

    res.status(201).json({
      message: `Đã gửi thông báo đến ${userIds.length} volunteer`,
      notification: {
        id: notification.id,
        title,
        content,
        type,
        sentTo: userIds.length
      }
    });
  } catch (err) {
    console.error("notifyEventVolunteers error:", err);
    res.status(500).json({ message: "Gửi thông báo thất bại" });
  }
};

/**
 * Send notification to all volunteers
 * Admin endpoint: POST /notifications/broadcast
 */
export const broadcastNotification = async (req, res) => {
  try {
    const { title, content, type = "SYSTEM" } = req.body;

    if (!title || !content) {
      return res.status(400).json({ 
        message: "Title và content là bắt buộc" 
      });
    }

    // Get all active volunteers
    const volunteers = await prisma.volunteer.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    if (volunteers.length === 0) {
      return res.status(200).json({ 
        message: "Không có volunteer nào hoạt động" 
      });
    }

    // Create a system notification (not tied to specific event)
    const notification = await prisma.notification.create({
      data: {
        title,
        content,
        type,
        eventId: null // System notification not tied to event
      }
    });

    // Create notification for each volunteer
    const notificationUsers = volunteers.map(v => ({
      userId: v.id,
      notificationId: notification.id,
      isRead: false
    }));

    await prisma.notificationUser.createMany({
      data: notificationUsers
    });

    res.status(201).json({
      message: `Đã gửi thông báo tới ${volunteers.length} volunteer`,
      notification: {
        id: notification.id,
        title,
        content,
        type,
        sentTo: volunteers.length
      }
    });
  } catch (err) {
    console.error("broadcastNotification error:", err);
    res.status(500).json({ message: "Gửi thông báo thất bại" });
  }
};

/**
 * Get all notifications for user (paginated)
 * User endpoint: GET /notifications?page=1&limit=10
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Lấy thông báo của user
    const notifications = await prisma.notificationUser.findMany({
      where: { userId },
      include: {
        notification: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: { notification: { createdAt: "desc" } },
      skip,
      take: limit
    });

    const total = await prisma.notificationUser.count({
      where: { userId }
    });

    // Format dữ liệu trả về
    const formattedNotifications = notifications.map(nu => ({
      id: nu.notification.id,
      title: nu.notification.title,
      content: nu.notification.content,
      type: nu.notification.type,
      isRead: nu.isRead,
      createdAt: nu.notification.createdAt,
      event: nu.notification.event
    }));

    res.json({
      notifications: formattedNotifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("getUserNotifications error:", err);
    res.status(500).json({ message: "Lỗi khi lấy thông báo" });
  }
};

/**
 * Get unread notifications for user
 * User endpoint: GET /notifications/unread
 */
export const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadNotifications = await prisma.notificationUser.findMany({
      where: {
        userId,
        isRead: false
      },
      include: {
        notification: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: { notification: { createdAt: "desc" } }
    });

    // Format dữ liệu trả về
    const formattedNotifications = unreadNotifications.map(nu => ({
      id: nu.notification.id,
      title: nu.notification.title,
      content: nu.notification.content,
      type: nu.notification.type,
      isRead: nu.isRead,
      createdAt: nu.notification.createdAt,
      event: nu.notification.event
    }));

    res.json({
      unreadNotifications: formattedNotifications,
      count: formattedNotifications.length
    });
  } catch (err) {
    console.error("getUnreadNotifications error:", err);
    res.status(500).json({ message: "Lỗi khi lấy thông báo chưa đọc" });
  }
};

/**
 * Mark all notifications as read for user
 * User endpoint: PUT /notifications/mark-all-read
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notificationUser.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ message: "Đã đánh dấu tất cả thông báo là đã đọc" });
  } catch (err) {
    console.error("markAllNotificationsAsRead error:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật thông báo" });
  }
};

/**
 * Mark notification as read
 * User endpoint: PUT /notifications/:notificationId/read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.notificationId);

    if (!notificationId) {
      return res.status(400).json({ message: "Notification ID không hợp lệ" });
    }

    const notificationUser = await prisma.notificationUser.update({
      where: {
        userId_notificationId: {
          userId,
          notificationId
        }
      },
      data: { isRead: true }
    });

    res.json({ 
      message: "Đã đánh dấu là đã đọc",
      notificationUser 
    });
  } catch (err) {
    console.error("markNotificationAsRead error:", err);
    res.status(400).json({ message: "Không thể cập nhật thông báo" });
  }
};

/**
 * Delete notification
 * User endpoint: DELETE /notifications/:notificationId
 */
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.notificationId);

    if (!notificationId) {
      return res.status(400).json({ message: "Notification ID không hợp lệ" });
    }

    await prisma.notificationUser.delete({
      where: {
        userId_notificationId: {
          userId,
          notificationId
        }
      }
    });

    res.json({ message: "Đã xóa thông báo" });
  } catch (err) {
    console.error("deleteNotification error:", err);
    res.status(400).json({ message: "Không thể xóa thông báo" });
  }
};

/**
 * Get unread notification count for user
 * User endpoint: GET /notifications/count
 */
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notificationUser.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({ unreadCount: count });
  } catch (err) {
    console.error("getUnreadNotificationCount error:", err);
    res.status(500).json({ message: "Lỗi khi lấy số thông báo" });
  }
};
