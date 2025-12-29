import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { register } from "../services/auth.service.js";
const prisma = new PrismaClient();

// Hàm hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
}

/* ===================== ADMIN ===================== */
export const getAdmin = async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }

  const id = parseInt(req.params.id);

  try {
    const admin = await prisma.volunteer.findUnique({ where: { id } });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ===================== VOLUNTEER ===================== */
export const listVolunteers = async (req, res) => {
  try {
    const volunteers = await prisma.volunteer.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    res.json({ volunteers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVolunteer = async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Không có quyền" });
  }
  const id = parseInt(req.params.id);

  try {
    const volunteer = await prisma.volunteer.findUnique({ where: { id } });
    if (!volunteer)
      return res.status(404).json({ message: "Volunteer không tồn tại" });

    const organizations = await prisma.$queryRaw`
      SELECT
        o."ID_ORGANIZATION" AS id,
        o."NAME",
        o."TYPE"
      FROM "PARTICIPATION" p
      JOIN "ORGANIZATION" o
        ON p."ID_ORGANIZATION" = o."ID_ORGANIZATION"
      WHERE p."ID_USER" = ${id}
    `;

    res.json({ ...volunteer, organizations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateVolunteer = async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Không có quyền" });
  }

  const id = parseInt(req.params.id);
  const {
    role,
    isActive,
    fullName,
    email,
    password,
    phone,
    address,
    bio
  } = req.body;

  const volunteer = await prisma.volunteer.findUnique({ where: { id } });
  if (!volunteer)
    return res.status(404).json({ message: "Volunteer không tồn tại" });

  if (volunteer.role === "SUPER_ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Không thể chỉnh sửa SUPER_ADMIN" });
  }

  const data = {};
  if (fullName) data.fullName = fullName;
  if (email) data.email = email;
  if (phone) data.phone = phone;
  if (address) data.address = address;
  if (bio) data.bio = bio;
  if (password) data.password = await hashPassword(password);

  if (req.user.id !== id) {
    if (role) {
      if (role === "SUPER_ADMIN" && req.user.role !== "SUPER_ADMIN") {
        return res
          .status(403)
          .json({ message: "Không thể gán role SUPER_ADMIN" });
      }
      data.role = role;
    }
    if (typeof isActive === "boolean") data.isActive = isActive;
  }

  const updated = await prisma.volunteer.update({ where: { id }, data });
  res.json(updated);
};

export const toggleVolunteerActive = async (req, res) => {
  const id = parseInt(req.params.id);
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Không có quyền" });
  }
  if (req.user.id === id) {
    return res
      .status(403)
      .json({ message: "Không thể tự thay đổi trạng thái của chính mình" });
  }

  const volunteer = await prisma.volunteer.findUnique({ where: { id } });
  if (!volunteer)
    return res.status(404).json({ message: "Volunteer không tồn tại" });
  if (volunteer.role === "SUPER_ADMIN")
    return res.status(403).json({ message: "Không thể khóa SUPER_ADMIN" });

  const updated = await prisma.volunteer.update({
    where: { id },
    data: { isActive: !volunteer.isActive }
  });
  res.json({ id: updated.id, isActive: updated.isActive });
};

/* ===================== ORGANIZATION ===================== */
export const listOrganizations = async (req, res) => {
  try {
    const orgs = await prisma.$queryRaw`
      SELECT
        o."ID_ORGANIZATION" AS id,
        o."NAME" AS name,
        o."TYPE" AS type,
        COUNT(p."ID_USER") AS "userCount"
      FROM "ORGANIZATION" o
      LEFT JOIN "PARTICIPATION" p
        ON o."ID_ORGANIZATION" = p."ID_ORGANIZATION"
      GROUP BY o."ID_ORGANIZATION", o."NAME", o."TYPE"
      ORDER BY o."ID_ORGANIZATION" ASC
    `;
    const formatted = orgs.map(function(o) {
      return {
        id: o.id,
        name: o.name,
        type: o.type,
        userCount: Number(o.userCount) || 0
      };
    });
    res.json({ organizations: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createOrganization = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      countryId,
      gender,
      dateOfBirth,
      address,
      bio,
      type
    } = req.body;

    // Kiểm tra trường bắt buộc
    if (!fullName || !email || !password || !countryId || !type) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Tạo tài khoản ORG
    const { volunteer } = await register({
      fullName,
      email,
      phone,
      password,
      countryId,
      gender,
      dateOfBirth,
      address,
      bio,
      role: "ORG",
      isActive: true
    });

    // Tạo tổ chức
    const organization = await prisma.organization.create({
      data: {
        name: fullName,
        type
      }
    });

    // Tạo participation giữa account ORG và organization
    await prisma.participation.create({
      data: {
        organizationId: organization.id,
        userId: volunteer.id,
        startDate: new Date(),
        role: "ORG"
      }
    });

    res.status(201).json({ organization, volunteer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getOrganizationDetail = async (req, res) => {
  const id = parseInt(req.params.id);
  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) return res.status(404).json({ message: "Organization not found" });

  const accounts = await prisma.volunteer.findMany({
    where: { participations: { some: { organizationId: id } }, role: "ORG" },
    select: { id: true, email: true, isActive: true, countryId: true }
  });

  res.json({ ...org, accounts });
};

export const updateOrganization = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, type } = req.body;
  if (!name || !type)
    return res.status(400).json({ message: "Thiếu thông tin" });

  const updated = await prisma.organization.update({
    where: { id },
    data: { name, type }
  });
  res.json(updated);
};

export const addOrganizationAccount = async (req, res) => {
  try {
    const orgId = parseInt(req.params.id, 10);
    const { email, password, countryId } = req.body;

    if (!email || !password || !countryId) {
      return res
        .status(400)
        .json({ message: "Email, password và countryId là bắt buộc" });
    }

    // Tạo account ORG
    const { volunteer } = await register({
      fullName: `ORG-${email}`,
      email,
      password,
      countryId,
      role: "ORG"
    });

    // Tạo participation cho tổ chức
    await prisma.participation.create({
      data: {
        organizationId: orgId, // phải đúng tên field trong schema
        userId: volunteer.id, // phải đúng tên field trong schema
        role: "ORG",
        startDate: new Date()
      }
    });

    res.status(201).json(volunteer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const toggleOrganizationAccountActive = async (req, res) => {
  const id = parseInt(req.params.id);
  const volunteer = await prisma.volunteer.findUnique({ where: { id } });
  if (!volunteer)
    return res.status(404).json({ message: "Account không tồn tại" });

  const updated = await prisma.volunteer.update({
    where: { id },
    data: { isActive: !volunteer.isActive }
  });
  res.json({ id: updated.id, isActive: updated.isActive });
};

export const deleteOrganizationAccount = async (req, res) => {
  const id = parseInt(req.params.id);
  const volunteer = await prisma.volunteer.findUnique({ where: { id } });
  if (!volunteer)
    return res.status(404).json({ message: "Account không tồn tại" });

  await prisma.volunteer.delete({ where: { id } });
  res.json({ message: "Deleted" });
};

export const deleteOrganization = async (req, res) => {
  const id = parseInt(req.params.id);
  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) return res.status(404).json({ message: "Organization not found" });

  const accounts = await prisma.volunteer.findMany({
    where: { participations: { some: { organizationId: id } }, role: "ORG" },
    select: { id: true }
  });

  for (let i = 0; i < accounts.length; i++) {
    await prisma.volunteer.delete({ where: { id: accounts[i].id } });
  }

  await prisma.organization.delete({ where: { id } });

  res.json({ message: "Organization deleted" });
};

/* ===================== EVENTS ===================== */
export const listEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        isApproved: true,
        startDate: true,
        endDate: true,
        organization: { select: { id: true, name: true } },
        commune: {
          select: {
            id: true,
            name: true,
            province: { select: { id: true, name: true } }
          }
        }
      }
    });

    const formatted = events.map(function(e) {
      let address = "—";
      if (e.commune && e.commune.name) {
        let provinceName = "—";
        if (e.commune.province && e.commune.province.name)
          provinceName = e.commune.province.name;
        address = e.commune.name + ", " + provinceName;
      }
      return {
        id: e.id,
        title: e.title,
        status: e.status,
        isApproved: e.isApproved,
        startDate: e.startDate,
        endDate: e.endDate,
        organization: e.organization,
        address
      };
    });

    res.json({ events: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveEvent = async (req, res) => {
  const id = parseInt(req.params.id);
  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Không có quyền duyệt hoạt động" });
  }

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event)
    return res.status(404).json({ message: "Hoạt động không tồn tại" });
  if (event.isApproved)
    return res
      .status(400)
      .json({ message: "Hoạt động đã được duyệt trước đó" });

  const updated = await prisma.event.update({
    where: { id },
    data: { isApproved: true }
  });
  res.json(updated);
};

export const statistics = async (req, res) => {
  try {
    const [volunteers, organizations, events, pending] = await Promise.all([
      prisma.volunteer.count(),
      prisma.organization.count(),
      prisma.event.count(),
      prisma.event.count({ where: { isApproved: false } })
    ]);
    res.json({ volunteers, organizations, events, pending });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getActionStats = async (req, res) => {
  try {
    const totalUsers = await prisma.volunteer.count();
    const pendingEvents = await prisma.event.count({
      where: { isApproved: false }
    });
    const reports = await prisma.notification.count({
      where: { type: "SYSTEM" }
    });
    res.json({ totalUsers, pendingEvents, reports });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getRecentEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        status: true
      }
    });
    const formatted = events.map(function(e) {
      return {
        id: e.id,
        name: e.title,
        date: e.startDate ? e.startDate.toISOString().split("T")[0] : "N/A",
        status: e.status
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventsByMonth = async (req, res) => {
  try {
    const rawData = await prisma.$queryRaw`
      SELECT EXTRACT(MONTH FROM "startDate") AS month, COUNT(*) AS count
      FROM "EVENT"
      GROUP BY EXTRACT(MONTH FROM "startDate")
      ORDER BY month
    `;
    const data = rawData.map(function(item) {
      return { month: Number(item.month), count: Number(item.count) };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
