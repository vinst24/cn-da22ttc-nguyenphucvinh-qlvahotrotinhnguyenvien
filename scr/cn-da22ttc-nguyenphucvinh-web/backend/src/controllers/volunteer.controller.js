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
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(gender && { gender }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(countryId && { countryId: parseInt(countryId) }),
        ...(address && { address })
      },
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

    res.json({ volunteer });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
      data: { avatar: avatarPath },
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

    res.json({ volunteer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------------------- GET AVAILABLE EVENTS -----------------------
export const getAvailableEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "UPCOMING",
        isApproved: true,
        OR: [
          { maxVolunteers: 0 },
          { currentParticipants: { lt: prisma.event.fields.maxVolunteers } }
        ]
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        commune: {
          select: {
            id: true,
            name: true,
            province: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        startDate: "asc"
      }
    });

    // If user provided, fetch joins to mark isRegistered
    let userJoins = [];
    if (req.user && req.user.id) {
      const eventIds = events.map(e => e.id);
      if (eventIds.length > 0) {
        const joins = await prisma.join.findMany({
          where: { userId: req.user.id, eventId: { in: eventIds } },
          select: { eventId: true }
        });
        userJoins = joins.map(j => j.eventId);
      }
    }

    const formatted = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      image: event.image,
      address: event.address,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      maxVolunteers: event.maxVolunteers,
      currentParticipants: event.currentParticipants,
      organizationName: event.organization?.name || "Unknown",
      communeName: event.commune?.name || "Unknown",
      provinceName: event.commune?.province?.name || "Unknown"
      ,
      isRegistered: userJoins.indexOf(event.id) !== -1
    }));

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
      event: {
        include: {
          organization: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      startDate: "asc"
    }
  });

  const formatted = events.map(function(j) {
    return {
      id: j.event.id,
      title: j.event.title,
      description: j.event.description,
      startDate: j.event.startDate,
      endDate: j.event.endDate,
      address: j.event.address,
      status: j.event.status,
      maxVolunteers: j.event.maxVolunteers,
      currentParticipants: j.event.currentParticipants,
      organizationName: j.event.organization?.name || "Unknown"
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

// ----------------------- GET EVENT DETAILS (PUBLIC) -----------------------
export const getEventDetail = async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Event ID không hợp lệ" });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        commune: {
          select: {
            id: true,
            name: true,
            province: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: "Hoạt động không tồn tại" });
    }

    // Get user's registration status if logged in
    let isRegistered = false;
    if (req.user && req.user.id) {
      const join = await prisma.join.findUnique({
        where: {
          userId_eventId: {
            userId: req.user.id,
            eventId: eventId
          }
        }
      });
      isRegistered = !!join;
    }

    res.json({
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        image: event.image,
        address: event.address,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        isApproved: event.isApproved,
        maxVolunteers: event.maxVolunteers,
        currentParticipants: event.currentParticipants,
        organizationId: event.organizationId,
        organizationName: event.organization?.name || "Unknown",
        communeName: event.commune?.name || "Unknown",
        provinceName: event.commune?.province?.name || "Unknown",
        isRegistered
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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

      // Check max volunteers - only validate if maxVolunteers > 0
      if (event.maxVolunteers > 0 && event.currentParticipants >= event.maxVolunteers) {
        throw new Error("Sự kiện đã đủ người");
      }

      await tx.join.create({
        data: {
          userId: userId,
          eventId: eventId,
          startDate: new Date()
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
    // Create notifications for admins and organization members
    try {
      // load event with organization
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (event) {
        // get admin users
        const admins = await prisma.volunteer.findMany({
          where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, isActive: true },
          select: { id: true }
        });

        // get organization participants (if event belongs to an org)
        let orgUsers = [];
        if (event.organizationId) {
          const parts = await prisma.participation.findMany({
            where: { organizationId: event.organizationId },
            select: { userId: true }
          });
          orgUsers = parts.map(p => p.userId);
        }

        const notifyUserIds = Array.from(new Set([
          ...admins.map(a => a.id),
          ...orgUsers
        ]));

        if (notifyUserIds.length > 0) {
          const notification = await prisma.notification.create({
            data: {
              eventId: eventId,
              title: `Có người đăng ký: ${event.title}`,
              content: `Người dùng đã đăng ký tham gia hoạt động \"${event.title}\".`,
              type: "EVENT"
            }
          });

          const notificationUsers = notifyUserIds.map(uid => ({
            userId: uid,
            notificationId: notification.id,
            isRead: false
          }));

          await prisma.notificationUser.createMany({ data: notificationUsers });
        }
      }
    } catch (err) {
      console.error("create notification after register error:", err.message);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ----------------------- UNREGISTER EVENT -----------------------
export const unregisterEvent = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const eventId = parseInt(req.params.id);

    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Event ID không hợp lệ" });
    }

    await prisma.$transaction(async function(tx) {
      const join = await tx.join.findUnique({
        where: {
          userId_eventId: {
            userId: userId,
            eventId: eventId
          }
        }
      });

      if (!join) {
        throw new Error("Bạn chưa đăng ký sự kiện này");
      }

      // Delete the join record
      await tx.join.delete({
        where: {
          userId_eventId: {
            userId: userId,
            eventId: eventId
          }
        }
      });

      // Decrement event participants
      await tx.event.update({
        where: { id: eventId },
        data: {
          currentParticipants: {
            decrement: 1
          }
        }
      });
    });

    res.json({ message: "Hủy đăng ký sự kiện thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
