import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js"; // file Prisma client

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "access-secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh-secret";
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";

// ------------------ Helpers ------------------
const generateAccessToken = volunteer => {
  return jwt.sign(
    { id: volunteer.id, role: volunteer.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

const generateRefreshToken = volunteer => {
  return jwt.sign({ id: volunteer.id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
};

// ------------------ Services ------------------

// Register
export const register = async ({
  fullName,
  email,
  phone,
  password,
  gender,
  dateOfBirth,
  countryId,
  address,
  role = "MEMBER",
  isActive = false
}) => {
  const existing = await prisma.volunteer.findUnique({
    where: { email }
  });
  if (existing) throw new Error("Email đã tồn tại");

  const existingPhone = await prisma.volunteer.findUnique({
    where: { phone }
  });
  if (existingPhone) {
    throw new Error("Số điện thoại đã tồn tại");
  }

  if (!countryId) {
    throw new Error("Quốc gia không hợp lệ");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo volunteer mới
  const volunteer = await prisma.volunteer.create({
    data: {
      fullName,
      email,
      phone,
      password: hashedPassword,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      address,
      role: role || "MEMBER",
      isActive: isActive === true,

      country: {
        connect: {
          id: countryId
        }
      }
    }
  });

  const accessToken = generateAccessToken(volunteer);
  const refreshToken = generateRefreshToken(volunteer);

  await prisma.volunteer.update({
    where: { id: volunteer.id },
    data: { refreshToken }
  });

  return { volunteer, accessToken, refreshToken };
};

// Login
export const login = async ({ email, password }) => {
  const volunteer = await prisma.volunteer.findUnique({
    where: { email }
  });

  if (!volunteer) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  // 🚫 CHẶN TÀI KHOẢN BỊ KHÓA
  if (volunteer.isActive === false) {
    throw new Error("Tài khoản đã bị khóa");
  }

  const match = await bcrypt.compare(password, volunteer.password);
  if (!match) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const accessToken = generateAccessToken(volunteer);
  const refreshToken = generateRefreshToken(volunteer);

  await prisma.volunteer.update({
    where: { id: volunteer.id },
    data: { refreshToken }
  });

  // ⚠️ không trả password về FE
  delete volunteer.password;

  return { volunteer, accessToken, refreshToken };
};

// Verify token
export const verifyToken = token => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (err) {
    return null;
  }
};

// Refresh access token từ refreshToken cookie
export const refresh = async token => {
  if (!token) {
    throw new Error("Không có refresh token");
  }

  let payload;
  try {
    payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new Error("Refresh token không hợp lệ hoặc đã hết hạn");
  }

  const volunteer = await prisma.volunteer.findUnique({
    where: { id: payload.id }
  });

  if (!volunteer || volunteer.refreshToken !== token) {
    throw new Error("Refresh token không hợp lệ");
  }

  // 🚫 CHẶN USER ĐÃ BỊ KHÓA
  if (volunteer.isActive === false) {
    throw new Error("Tài khoản đã bị khóa");
  }

  const accessToken = generateAccessToken(volunteer);
  return { accessToken, volunteer };
};

// Logout
export const logout = async volunteerId => {
  await prisma.volunteer.update({
    where: { id: volunteerId },
    data: { refreshToken: null }
  });
  return true;
};
