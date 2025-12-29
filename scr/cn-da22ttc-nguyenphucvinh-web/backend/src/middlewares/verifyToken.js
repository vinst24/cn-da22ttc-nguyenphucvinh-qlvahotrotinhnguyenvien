// middlewares/verifyToken.middleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = auth.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded thường chứa: { id, role, iat, exp }
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({ message: "Token invalid or expired" });
  }
};
