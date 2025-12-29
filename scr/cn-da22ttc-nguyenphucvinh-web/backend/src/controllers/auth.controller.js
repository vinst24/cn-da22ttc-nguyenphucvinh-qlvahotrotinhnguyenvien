import {
  login,
  logout,
  refresh,
  register,
  verifyToken
} from "../services/auth.service.js";

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
