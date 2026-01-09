import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Lấy thông tin organization (theo param id)
export const getOrganization = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org)
      return res.status(404).json({ message: "Organization not found" });
    res.json({ organization: org });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật thông tin organization (ADMIN)
export const updateOrganization = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, type } = req.body;
  try {
    const org = await prisma.organization.update({
      where: { id },
      data: { name, type }
    });
    res.json({ organization: org });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper: resolve organizationId cho user ORG
// const resolveOrgId = async (req) => {
//   if (req.params && req.params.id) return parseInt(req.params.id);
//   const participation = await prisma.participation.findFirst({ where: { userId: req.user.id } });
//   return participation?.organizationId || null;
// };
const resolveOrgId = async req => {
  // ADMIN mới được lấy orgId từ param
  if (req.user && req.user.role === "ADMIN" && req.params && req.params.orgId) {
    const orgId = Number(req.params.orgId);
    return isNaN(orgId) ? null : orgId;
  }

  // ORG: lấy từ participation
  if (req.user && req.user.role === "ORG") {
    if (req.user.organizationId) {
      return req.user.organizationId;
    }

    const participation = await prisma.participation.findFirst({
      where: { userId: req.user.id },
      orderBy: { startDate: "desc" }
    });

    if (!participation) return null;

    req.user.organizationId = participation.organizationId;
    return participation.organizationId;
  }

  return null;
};

// Lấy danh sách event của organization
export const getOrganizationEvents = async (req, res) => {
  try {
    const orgId = await resolveOrgId(req);
    if (!orgId) {
      return res
        .status(404)
        .json({ message: "Organization not found for user" });
    }

    const events = await prisma.event.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { joins: true }
        }
      }
    });

    // Map dữ liệu cho frontend
    const result = events.map(function(e) {
      return {
        id: e.id,
        title: e.title,
        status: e.status,
        startDate: e.startDate,
        maxVolunteers: e.maxVolunteers,
        currentParticipants: e._count.joins
      };
    });

    res.json({ events: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách volunteer của organization
export const getOrganizationVolunteers = async (req, res) => {
  try {
    const orgId = await resolveOrgId(req);
    if (!orgId)
      return res
        .status(404)
        .json({ message: "Organization not found for user" });

    const participations = await prisma.participation.findMany({
      where: { organizationId: orgId },
      include: { volunteer: true }
    });

    const volunteers = participations.map(p => ({
      id: p.volunteer.id,
      fullName: p.volunteer.fullName,
      email: p.volunteer.email,
      phone: p.volunteer.phone,
      role: p.volunteer.role
    }));

    res.json({ volunteers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy thống kê (tên trường chuẩn để frontend hiển thị)
export const getOrganizationStats = async (req, res) => {
  try {
    const orgId = await resolveOrgId(req);
    if (!orgId) {
      return res
        .status(404)
        .json({ message: "Organization not found for user" });
    }

    const totalActivities = await prisma.event.count({
      where: { organizationId: orgId }
    });

    const totalVolunteers = await prisma.join.count({
      where: { event: { organizationId: orgId } }
    });

    const upcoming = await prisma.event.count({
      where: {
        organizationId: orgId,
        status: "UPCOMING"
      }
    });

    const ongoing = await prisma.event.count({
      where: {
        organizationId: orgId,
        status: "ONGOING"
      }
    });

    const completed = await prisma.event.count({
      where: {
        organizationId: orgId,
        status: "FINISHED"
      }
    });

    res.json({
      totalActivities,
      totalVolunteers,
      upcoming,
      ongoing,
      completed
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo hoạt động mới
export const createOrganizationEvent = async (req, res) => {
  try {
    const orgId = await resolveOrgId(req);
    if (!orgId)
      return res.status(403).json({ message: "Bạn không thuộc tổ chức nào" });

    const {
      title,
      description,
      communeId,
      address,
      startDate,
      endDate,
      status,
      maxVolunteers
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        address,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
        communeId: Number(communeId),
        organizationId: orgId,
        maxVolunteers: Number(maxVolunteers)
      }
    });

    // Gửi thông báo cho ADMIN khi tổ chức tạo hoạt động mới (chờ duyệt)
    try {
      const adminNotification = await prisma.notification.create({
        data: {
          eventId: event.id,
          title: `Hoạt động chờ duyệt: ${event.title}`,
          content: `Tổ chức đã tạo hoạt động mới "${event.title}" và chờ duyệt từ admin. Chi tiết: ${description || "Không có mô tả"}`,
          type: "SYSTEM"
        }
      });

      // Gửi đến tất cả ADMIN
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
          notificationId: adminNotification.id,
          isRead: false
        }));
        await prisma.notificationUser.createMany({ data: adminNotificationUsers });
      }
    } catch (err) {
      console.error("Lỗi gửi thông báo cho admin:", err.message);
    }

    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Tạo hoạt động thất bại" });
  }
};

// Cập nhật hoạt động
export const updateOrganizationEvent = async (req, res) => {
  try {
    const orgId = await resolveOrgId(req);
    if (!orgId)
      return res.status(403).json({ message: "Bạn không thuộc tổ chức nào" });

    const id = Number(req.params.id);

    // Lọc những trường được phép update
    const {
      title,
      description,
      address,
      startDate,
      endDate,
      status,
      communeId,
      maxVolunteers
    } = req.body;

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (address !== undefined) dataToUpdate.address = address;
    if (startDate !== undefined) dataToUpdate.startDate = new Date(startDate);
    if (endDate !== undefined) dataToUpdate.endDate = new Date(endDate);
    if (status !== undefined) dataToUpdate.status = status;
    if (communeId !== undefined) dataToUpdate.communeId = Number(communeId);
    if (maxVolunteers !== undefined)
      dataToUpdate.maxVolunteers = Number(maxVolunteers);

    const event = await prisma.event.update({
      where: { id },
      data: dataToUpdate
    });
    res.json({ event });

    if (startDate !== undefined)
      dataToUpdate.startDate = startDate ? new Date(startDate) : null;

    if (endDate !== undefined)
      dataToUpdate.endDate = endDate ? new Date(endDate) : null;

    if (!event.count) {
      return res
        .status(404)
        .json({ message: "Event not found or không thuộc tổ chức" });
    }

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("DEBUG updateOrganizationEvent:", err);
    res.status(500).json({ message: err.message });
  }
};

// Xoá hoạt động
// export const deleteOrganizationEvent = async (req, res) => {
//   try {
//     const orgId = await resolveOrgId(req);
//     if (!orgId)
//       return res.status(403).json({ message: "Bạn không thuộc tổ chức nào" });

//     const id = Number(req.params.id);

//     const deleted = await prisma.event.deleteMany({
//       where: { id, organizationId: orgId }
//     });
//     if (startDate !== undefined)
//       dataToUpdate.startDate = startDate ? new Date(startDate) : null;

//     if (endDate !== undefined)
//       dataToUpdate.endDate = endDate ? new Date(endDate) : null;

//     if (!deleted.count) {
//       return res
//         .status(404)
//         .json({ message: "Event not found or không thuộc tổ chức" });
//     }

//     res.json({ message: "Deleted successfully" });
//   } catch (err) {
//     console.error("DEBUG deleteOrganizationEvent:", err);
//     res.status(500).json({ message: err.message });
//   }
// };
export const deleteOrganizationEvent = async (req, res) => {
  try {
    const orgId = await resolveOrgId(req);
    if (!orgId) {
      return res.status(403).json({ message: "Bạn không thuộc tổ chức nào" });
    }

    const id = Number(req.params.id);

    // 1️⃣ Xoá các join trước
    await prisma.join.deleteMany({
      where: { eventId: id }
    });

    // 2️⃣ Xoá event
    const deleted = await prisma.event.deleteMany({
      where: {
        id,
        organizationId: orgId
      }
    });

    if (!deleted.count) {
      return res
        .status(404)
        .json({ message: "Event not found or không thuộc tổ chức" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE EVENT ERROR:", err);
    res.status(500).json({ message: "Delete event failed" });
  }
};

// Lấy chi tiết hoạt động theo ID
export const getOrganizationEventById = async (req, res) => {
  try {
    const orgId = await resolveOrgId(req);
    if (!orgId) {
      return res.status(403).json({ message: "Bạn không thuộc tổ chức nào" });
    }

    const id = Number(req.params.id);

    const event = await prisma.event.findFirst({
      where: {
        id: id,
        organizationId: orgId
      },
      include: {
        commune: {
          select: {
            id: true,
            provinceId: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 👇 TRẢ DATA CHUẨN CHO FRONTEND
    res.json({
      id: event.id,
      title: event.title,
      description: event.description,
      address: event.address,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      communeId: event.communeId,
      provinceId: event.commune ? event.commune.provinceId : "",
      organizationId: event.organizationId,
      maxVolunteers: event.maxVolunteers
    });
  } catch (err) {
    console.error("getOrganizationEventById error:", err);
    res.status(500).json({ message: "Fetch event failed" });
  }
};

export const getEventParticipants = async (req, res) => {
  try {
    const orgId = await resolveOrgId(req);
    if (!orgId) {
      return res.status(403).json({ message: "Không có quyền" });
    }

    const eventId = Number(req.params.id);

    // Kiểm tra event có thuộc tổ chức không
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId: orgId
      }
    });

    if (!event) {
      return res.status(404).json({ message: "Hoạt động không tồn tại" });
    }

    // Lấy danh sách người tham gia
    const joins = await prisma.join.findMany({
      where: { eventId: eventId },
      include: {
        volunteer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { startDate: "desc" }
    });

    const participants = joins.map(function(j) {
      return {
        id: j.volunteer.id,
        fullName: j.volunteer.fullName,
        email: j.volunteer.email,
        phone: j.volunteer.phone,
        joinedAt: j.startDate
      };
    });

    res.json({ participants });
  } catch (err) {
    console.error("getEventParticipants error:", err);
    res.status(500).json({ message: "Fetch participants failed" });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const orgId = await resolveOrgId(req);
    if (!orgId) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const events = await prisma.event.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true
      }
    });

    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMonthlyEventsStats = async (req, res) => {
  try {
    const orgId = await resolveOrgId(req);
    if (!orgId) {
      return res.status(403).json({ message: "Không có tổ chức" });
    }

    const year = new Date().getFullYear();

    const events = await prisma.event.findMany({
      where: {
        organizationId: orgId,
        createdAt: {
          gte: new Date(year + "-01-01"),
          lte: new Date(year + "-12-31")
        }
      },
      select: { createdAt: true }
    });

    const result = Array(12).fill(0);

    events.forEach(e => {
      const month = new Date(e.createdAt).getMonth(); // 0-11
      result[month]++;
    });

    res.json({ year, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Monthly stats failed" });
  }
};

export const getMonthlyVolunteerStats = async (req, res) => {
  try {
    const orgId = await resolveOrgId(req);
    if (!orgId) {
      return res.status(403).json({ message: "Không có tổ chức" });
    }

    const year = new Date().getFullYear();

    const joins = await prisma.join.findMany({
      where: {
        event: { organizationId: orgId },
        startDate: {
          gte: new Date(year + "-01-01"),
          lte: new Date(year + "-12-31")
        }
      },
      select: { startDate: true }
    });

    const result = Array(12).fill(0);

    joins.forEach(function(j) {
      if (!j.startDate) return;
      const month = new Date(j.startDate).getMonth();
      result[month]++;
    });

    res.json({ year, data: result });
  } catch (err) {
    console.error("Volunteer stats error:", err);
    res.status(500).json({ message: "Volunteer stats failed" });
  }
};

