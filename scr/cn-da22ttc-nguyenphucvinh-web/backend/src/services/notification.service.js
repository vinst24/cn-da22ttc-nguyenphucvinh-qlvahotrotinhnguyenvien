import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Service để gửi thông báo cho tình nguyện viên khi hoạt động sắp diễn ra
 * @param {number} eventId - ID của hoạt động
 * @param {number} minutesBefore - Số phút trước khi hoạt động bắt đầu
 */
export const notifyUpcomingEventVolunteers = async (eventId, minutesBefore = 60) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        joins: {
          select: { userId: true }
        }
      }
    });

    if (!event) {
      console.log(`Event ${eventId} không tồn tại`);
      return { success: false, message: "Event not found" };
    }

    // Kiểm tra xem hoạt động có sắp diễn ra không
    const now = new Date();
    const eventStartTime = new Date(event.startDate);
    const timeDifference = eventStartTime.getTime() - now.getTime();
    const minutesDifference = timeDifference / (1000 * 60);

    // Nếu hoạt động sẽ bắt đầu trong khoảng từ minutesBefore tới minutesBefore - 1 phút
    if (minutesDifference <= minutesBefore && minutesDifference > minutesBefore - 1) {
      const userIds = event.joins.map(j => j.userId);

      if (userIds.length === 0) {
        return { success: true, message: "No volunteers to notify" };
      }

      const notification = await prisma.notification.create({
        data: {
          eventId: eventId,
          title: `Hoạt động sắp bắt đầu: ${event.title}`,
          content: `Hoạt động "${event.title}" sẽ bắt đầu vào ${eventStartTime.toLocaleString("vi-VN")}`,
          type: "EVENT"
        }
      });

      const notificationUsers = userIds.map(userId => ({
        userId,
        notificationId: notification.id,
        isRead: false
      }));

      await prisma.notificationUser.createMany({ data: notificationUsers });

      return {
        success: true,
        message: `Thông báo đã gửi tới ${userIds.length} tình nguyện viên`,
        notificationId: notification.id,
        volunteersCount: userIds.length
      };
    }

    return { success: true, message: "Event is not in the notification window" };
  } catch (err) {
    console.error("notifyUpcomingEventVolunteers error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Service để gửi thông báo cho tình nguyện viên khi hoạt động đang diễn ra
 * @param {number} eventId - ID của hoạt động
 */
export const notifyOngoingEventVolunteers = async (eventId) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        joins: {
          select: { userId: true }
        }
      }
    });

    if (!event) {
      console.log(`Event ${eventId} không tồn tại`);
      return { success: false, message: "Event not found" };
    }

    // Kiểm tra xem hoạt động có đang diễn ra không
    const now = new Date();
    const eventStartTime = new Date(event.startDate);
    const eventEndTime = event.endDate ? new Date(event.endDate) : null;

    const isOngoing = now >= eventStartTime && (!eventEndTime || now <= eventEndTime);

    if (!isOngoing) {
      return { success: true, message: "Event is not ongoing" };
    }

    // Kiểm tra xem đã gửi thông báo cho hoạt động này chưa (để tránh spam)
    const existingNotification = await prisma.notification.findFirst({
      where: {
        eventId: eventId,
        title: { contains: "đang diễn ra" }
      }
    });

    if (existingNotification) {
      return { success: true, message: "Notification already sent for this event" };
    }

    const userIds = event.joins.map(j => j.userId);

    if (userIds.length === 0) {
      return { success: true, message: "No volunteers to notify" };
    }

    const notification = await prisma.notification.create({
      data: {
        eventId: eventId,
        title: `Hoạt động đang diễn ra: ${event.title}`,
        content: `Hoạt động "${event.title}" đang diễn ra ngay bây giờ!`,
        type: "EVENT"
      }
    });

    const notificationUsers = userIds.map(userId => ({
      userId,
      notificationId: notification.id,
      isRead: false
    }));

    await prisma.notificationUser.createMany({ data: notificationUsers });

    return {
      success: true,
      message: `Thông báo đã gửi tới ${userIds.length} tình nguyện viên`,
      notificationId: notification.id,
      volunteersCount: userIds.length
    };
  } catch (err) {
    console.error("notifyOngoingEventVolunteers error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Service để gửi thông báo cho admin về hoạt động chờ duyệt
 * @param {object} event - Đối tượng hoạt động
 */
export const notifyAdminPendingEvent = async (event) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        eventId: event.id,
        title: `Hoạt động chờ duyệt: ${event.title}`,
        content: `Tổ chức đã tạo hoạt động mới "${event.title}" và chờ duyệt từ admin.`,
        type: "SYSTEM"
      }
    });

    const admins = await prisma.volunteer.findMany({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
        isActive: true
      },
      select: { id: true }
    });

    if (admins.length > 0) {
      const adminNotificationUsers = admins.map(admin => ({
        userId: admin.id,
        notificationId: notification.id,
        isRead: false
      }));
      await prisma.notificationUser.createMany({ data: adminNotificationUsers });
    }

    return {
      success: true,
      message: `Thông báo đã gửi tới ${admins.length} admin`,
      notificationId: notification.id,
      adminsCount: admins.length
    };
  } catch (err) {
    console.error("notifyAdminPendingEvent error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Service để gửi thông báo cho tất cả tình nguyện viên về hoạt động mới được duyệt
 * @param {object} event - Đối tượng hoạt động
 */
export const notifyAllVolunteersApprovedEvent = async (event) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        eventId: event.id,
        title: `Hoạt động mới được duyệt: ${event.title}`,
        content: `Hoạt động "${event.title}" đã được duyệt. Hãy tham gia nếu bạn quan tâm!`,
        type: "EVENT"
      }
    });

    const volunteers = await prisma.volunteer.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    if (volunteers.length > 0) {
      const notificationUsers = volunteers.map(v => ({
        userId: v.id,
        notificationId: notification.id,
        isRead: false
      }));
      await prisma.notificationUser.createMany({ data: notificationUsers });
    }

    return {
      success: true,
      message: `Thông báo đã gửi tới ${volunteers.length} tình nguyện viên`,
      notificationId: notification.id,
      volunteersCount: volunteers.length
    };
  } catch (err) {
    console.error("notifyAllVolunteersApprovedEvent error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Hàm để kiểm tra và gửi thông báo cho tất cả hoạt động sắp diễn ra
 * Nên chạy định kỳ (ví dụ mỗi phút)
 */
export const checkAndNotifyUpcomingEvents = async (minutesBefore = 60) => {
  try {
    const now = new Date();
    const timeFromNow = new Date(now.getTime() + minutesBefore * 60 * 1000);

    // Lấy tất cả hoạt động sắp diễn ra trong khoảng thời gian chỉ định
    const upcomingEvents = await prisma.event.findMany({
      where: {
        status: { in: ["UPCOMING", "ONGOING"] },
        isApproved: true,
        startDate: {
          gte: now,
          lte: timeFromNow
        }
      },
      include: {
        joins: {
          select: { userId: true }
        }
      }
    });

    let totalNotifications = 0;

    for (const event of upcomingEvents) {
      const userIds = event.joins.map(j => j.userId);

      if (userIds.length === 0) continue;

      // Kiểm tra xem đã gửi thông báo chưa
      const existingNotification = await prisma.notification.findFirst({
        where: {
          eventId: event.id,
          title: { contains: "sắp bắt đầu" }
        }
      });

      if (existingNotification) continue;

      const notification = await prisma.notification.create({
        data: {
          eventId: event.id,
          title: `Hoạt động sắp bắt đầu: ${event.title}`,
          content: `Hoạt động "${event.title}" sẽ bắt đầu vào ${new Date(event.startDate).toLocaleString("vi-VN")}`,
          type: "EVENT"
        }
      });

      const notificationUsers = userIds.map(userId => ({
        userId,
        notificationId: notification.id,
        isRead: false
      }));

      await prisma.notificationUser.createMany({ data: notificationUsers });
      totalNotifications += userIds.length;
    }

    return {
      success: true,
      message: `Đã kiểm tra ${upcomingEvents.length} hoạt động sắp diễn ra`,
      eventsFound: upcomingEvents.length,
      notificationsSent: totalNotifications
    };
  } catch (err) {
    console.error("checkAndNotifyUpcomingEvents error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Hàm để kiểm tra và gửi thông báo cho tất cả hoạt động đang diễn ra
 */
export const checkAndNotifyOngoingEvents = async () => {
  try {
    const now = new Date();

    // Lấy tất cả hoạt động đang diễn ra
    const ongoingEvents = await prisma.event.findMany({
      where: {
        status: "ONGOING",
        isApproved: true,
        startDate: { lte: now },
        endDate: {
          gte: now
        }
      },
      include: {
        joins: {
          select: { userId: true }
        }
      }
    });

    let totalNotifications = 0;

    for (const event of ongoingEvents) {
      const userIds = event.joins.map(j => j.userId);

      if (userIds.length === 0) continue;

      // Kiểm tra xem đã gửi thông báo chưa
      const existingNotification = await prisma.notification.findFirst({
        where: {
          eventId: event.id,
          title: { contains: "đang diễn ra" }
        }
      });

      if (existingNotification) continue;

      const notification = await prisma.notification.create({
        data: {
          eventId: event.id,
          title: `Hoạt động đang diễn ra: ${event.title}`,
          content: `Hoạt động "${event.title}" đang diễn ra ngay bây giờ!`,
          type: "EVENT"
        }
      });

      const notificationUsers = userIds.map(userId => ({
        userId,
        notificationId: notification.id,
        isRead: false
      }));

      await prisma.notificationUser.createMany({ data: notificationUsers });
      totalNotifications += userIds.length;
    }

    return {
      success: true,
      message: `Đã kiểm tra ${ongoingEvents.length} hoạt động đang diễn ra`,
      eventsFound: ongoingEvents.length,
      notificationsSent: totalNotifications
    };
  } catch (err) {
    console.error("checkAndNotifyOngoingEvents error:", err);
    return { success: false, error: err.message };
  }
};
