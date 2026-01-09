import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import {
  login,
  logout,
  refresh,
  register,
  verifyToken
} from "../services/auth.service.js";

const prisma = new PrismaClient();

export const registerController = async (req, res) => {
  console.log("REGISTER BODY:", req.body);

  try {
    const {
      fullName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      countryId,
      address,
      role
    } = req.body;

    if (!countryId) {
      return res.status(400).json({ message: "Country is required" });
    }

    const { volunteer, accessToken, refreshToken } = await register({
      fullName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      countryId,
      address,
      role: role || "MEMBER"
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ volunteer, accessToken });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// ------------------ Login ------------------
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { volunteer, accessToken, refreshToken } = await login({
      email,
      password
    });

    console.log("LOGIN VOLUNTEER:", volunteer);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ volunteer, accessToken });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ------------------ Verify Access Token ------------------
export const verifyTokenController = (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token không được cung cấp" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc hết hạn" });
    }

    res.json({ valid: true, payload });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

// ------------------ Refresh Access Token ------------------
export const refreshController = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token)
      return res.status(401).json({ message: "Refresh token không tìm thấy" });

    const { accessToken, volunteer } = await refresh(token);
    console.log("REFRESH VOLUNTEER:", volunteer);
    res.json({ accessToken, volunteer });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

// ------------------ Logout ------------------
export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // decode refresh token để lấy volunteer id
      const decoded = jwt.decode(token);

      if (decoded && decoded.id) {
        await logout(decoded.id);
      }
    }

    // Xóa cookie refreshToken
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });

    res.json({ message: "Đăng xuất thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ------------------ Forgot Password ------------------
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    const volunteer = await prisma.volunteer.findUnique({
      where: { email }
    });

    if (!volunteer) {
      // Don't reveal if email exists for security reasons
      return res.status(200).json({ 
        message: "Nếu email tồn tại, một liên kết cấp lại mật khẩu sẽ được gửi" 
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save reset token to database
    await prisma.passwordReset.create({
      data: {
        userId: volunteer.id,
        token,
        expiresAt
      }
    });

    // TODO: Send email to volunteer and admin with reset link
    // For now, just return success message
    // In production, you would send an email with: /reset-password?token={token}

    console.log(`Password reset token for ${email}: ${token}`);

    res.json({ 
      message: "Liên kết cấp lại mật khẩu đã được gửi đến email của bạn",
      token // Remove in production - only for testing
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi xử lý yêu cầu" });
  }
};

// ------------------ Reset Password ------------------
export const resetPasswordController = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: "Token và mật khẩu mới là bắt buộc" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "Mật khẩu phải có ít nhất 6 ký tự" 
      });
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token }
    });

    if (!resetRecord) {
      return res.status(400).json({ 
        message: "Token không hợp lệ hoặc đã hết hạn" 
      });
    }

    // Check if token is expired
    if (new Date() > resetRecord.expiresAt) {
      await prisma.passwordReset.delete({ where: { token } });
      return res.status(400).json({ 
        message: "Token đã hết hạn" 
      });
    }

    // Hash new password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update volunteer password
    await prisma.volunteer.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword }
    });

    // Delete reset token
    await prisma.passwordReset.delete({ where: { token } });

    res.json({ message: "Mật khẩu đã được cấp lại thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi cấp lại mật khẩu" });
  }
};
