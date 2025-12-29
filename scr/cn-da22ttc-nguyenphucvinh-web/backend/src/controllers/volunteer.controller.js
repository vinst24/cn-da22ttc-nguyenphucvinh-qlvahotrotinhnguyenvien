// controllers/volunteer.controller.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

// ----------------------- GET ALL -----------------------
export const getVolunteers = async (req, res) => {
  try {
    const volunteers = await prisma.volunteer.findMany();
    res.json({ volunteers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------- GET BY ID -----------------------
export const getVolunteer = async (req, res) => {
  const id = parseInt(req.params.id);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.id !== id && req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const volunteer = await prisma.volunteer.findUnique({
    where: { id: id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatar: true,
      gender: true,
      dateOfBirth: true,
      address: true,
      role: true,
      createdAt: true
    }
  });

  if (!volunteer) {
    return res.status(404).json({ message: "Volunteer không tồn tại" });
  }

  res.json({ volunteer });
};

// ----------------------- CREATE -----------------------
export const createVolunteer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      gender,
      dateOfBirth,
      countryId,
      address
    } = req.body;

    const volunteer = await prisma.volunteer.create({
      data: {
        fullName,
        email,
        phone,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        countryId: countryId ? parseInt(countryId) : null,
        address
      }
    });

    res.status(201).json({ volunteer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------------- UPDATE -----------------------
export const updateVolunteer = async (req, res) => {
  const id = parseInt(req.params.id);

  const { fullName, phone, gender, dateOfBirth, countryId, address } = req.body;

  try {
    const volunteer = await prisma.volunteer.update({
      where: { id },
      data: {
        fullName,
        phone,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        countryId: countryId ? parseInt(countryId) : null,
        address
      }
    });

    res.json({ volunteer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------------- CHANGE PASSWORD -----------------------
export const changePassword = async (req, res) => {
  const id = parseInt(req.params.id);
  const { currentPassword, newPassword } = req.body;

  try {
    const volunteer = await prisma.volunteer.findUnique({ where: { id } });
    if (!volunteer)
      return res.status(404).json({ message: "Volunteer không tồn tại" });

    // verify current password
    const match = await bcrypt.compare(currentPassword, volunteer.password);
    if (!match)
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.volunteer.update({
      where: { id },
      data: { password: hashed }
    });

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------------- DELETE -----------------------
export const deleteVolunteer = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.volunteer.delete({
      where: { id }
    });

    res.json({ message: "Xóa volunteer thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------------- UPLOAD AVATAR -----------------------
export const uploadAvatar = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const avatarPath = `/uploads/${req.file.filename}`;

    const volunteer = await prisma.volunteer.update({
      where: { id },
      data: { avatar: avatarPath }
    });

    res.json({ volunteer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------------- GET AVAILABLE EVENTS -----------------------
export const getAvailableEvents = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    const events = await prisma.event.findMany({
      where: {
        isApproved: true,
        status: "UPCOMING"
      },
      include: {
        joins: {
          where: {
            userId: userId
          }
        }
      },
      orderBy: {
        startDate: "asc"
      }
    });

    const formatted = events.map(function(e) {
      return {
        id: e.id,
        title: e.title,
        startDate: e.startDate,
        address: e.address,
        isRegistered: e.joins && e.joins.length > 0
      };
    });

    res.json({ events: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------- GET REGISTERED EVENTS -----------------------
export const getRegisteredEvents = async (req, res) => {
  const userId = parseInt(req.params.id);

  if (!req.user || req.user.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const events = await prisma.join.findMany({
    where: { userId: userId },
    include: {
      event: true
    },
    orderBy: {
      startDate: "asc"
    }
  });

  const formatted = events.map(function(j) {
    return {
      id: j.event.id,
      title: j.event.title,
      startDate: j.event.startDate,
      status: j.event.status
    };
  });

  res.json({ events: formatted });
};

// ----------------------- GET NOTIFICATIONS -----------------------
export const getNotifications = async (req, res) => {
  const userId = parseInt(req.params.id);

  if (!req.user || req.user.id !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const notifications = await prisma.notificationUser.findMany({
    where: { userId: userId },
    include: {
      notification: true
    },
    orderBy: {
      notification: {
        createdAt: "desc"
      }
    }
  });

  const formatted = notifications.map(function(n) {
    return {
      id: n.notification.id,
      title: n.notification.title,
      content: n.notification.content,
      isRead: n.isRead
    };
  });

  res.json({ notifications: formatted });
};

// ----------------------- REGISTER EVENT -----------------------
export const registerEvent = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Event ID không hợp lệ" });
    }

    const existing = await prisma.join.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ message: "Đã đăng ký sự kiện này" });
    }

    await prisma.$transaction(async function(tx) {
      const event = await tx.event.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        throw new Error("Sự kiện không tồn tại");
      }

      if (event.status !== "UPCOMING") {
        throw new Error("Sự kiện không còn nhận đăng ký");
      }

      if (event.currentParticipants >= event.maxVolunteers) {
        throw new Error("Sự kiện đã đủ người");
      }

      await tx.join.create({
        data: {
          userId: userId,
          eventId: eventId
        }
      });

      await tx.event.update({
        where: { id: eventId },
        data: {
          currentParticipants: {
            increment: 1
          }
        }
      });
    });

    res.status(201).json({ message: "Đăng ký sự kiện thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
