import { checkAndNotifyOngoingEvents, checkAndNotifyUpcomingEvents } from "../services/notification.service.js";

/**
 * Background Job: Kiểm tra và gửi thông báo cho hoạt động sắp diễn ra
 * Chạy mỗi phút
 */
export const upcomingEventNotificationJob = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Checking upcoming events...`);
    const result = await checkAndNotifyUpcomingEvents(60); // Thông báo 60 phút trước
    if (result.success) {
      console.log(`[${new Date().toISOString()}] ${result.message}`);
      if (result.eventsFound > 0) {
        console.log(`  - Hoạt động tìm thấy: ${result.eventsFound}`);
        console.log(`  - Thông báo đã gửi: ${result.notificationsSent}`);
      }
    } else {
      console.error(`[${new Date().toISOString()}] Error: ${result.error}`);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] upcomingEventNotificationJob error:`, err);
  }
};

/**
 * Background Job: Kiểm tra và gửi thông báo cho hoạt động đang diễn ra
 * Chạy mỗi phút
 */
export const ongoingEventNotificationJob = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Checking ongoing events...`);
    const result = await checkAndNotifyOngoingEvents();
    if (result.success) {
      console.log(`[${new Date().toISOString()}] ${result.message}`);
      if (result.eventsFound > 0) {
        console.log(`  - Hoạt động đang diễn ra: ${result.eventsFound}`);
        console.log(`  - Thông báo đã gửi: ${result.notificationsSent}`);
      }
    } else {
      console.error(`[${new Date().toISOString()}] Error: ${result.error}`);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ongoingEventNotificationJob error:`, err);
  }
};

/**
 * Khởi tạo tất cả background jobs
 * Nên được gọi từ server.js khi ứng dụng khởi động
 */
export const initializeNotificationJobs = (interval = 60000) => {
  console.log(`[${new Date().toISOString()}] Initializing notification background jobs...`);
  
  // Chạy ngay lập tức lần đầu
  upcomingEventNotificationJob();
  ongoingEventNotificationJob();
  
  // Thiết lập interval định kỳ (mặc định 60 giây)
  setInterval(upcomingEventNotificationJob, interval);
  setInterval(ongoingEventNotificationJob, interval);
  
  console.log(`[${new Date().toISOString()}] Notification background jobs initialized (interval: ${interval}ms)`);
};
