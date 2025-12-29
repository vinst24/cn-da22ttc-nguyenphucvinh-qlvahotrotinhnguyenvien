import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Middleware xác thực Access Token + check isActive
export const verifyAccessToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token không được cung cấp" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 CHECK USER TRONG DB
    const user = await prisma.volunteer.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Tài khoản của bạn hiện đang khóa"
      });
    }

    req.user = {
      id: user.id,
      role: user.role
    };

    next();
  } catch (err) {
    return res.status(403).json({
      message: "Access token không hợp lệ hoặc hết hạn"
    });
  }
};

// Giữ alias cũ cho các route đang dùng
export const authenticate = verifyAccessToken;

// Middleware kiểm tra role (GIỮ NGUYÊN)
export const requireRole = role => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Chưa xác thực" });
  }

  if (Array.isArray(role)) {
    if (!role.includes(req.user.role)) {
      return res.status(403).json({ message: "Không đủ quyền truy cập" });
    }
  } else {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Không đủ quyền truy cập" });
    }
  }

  next();
};
