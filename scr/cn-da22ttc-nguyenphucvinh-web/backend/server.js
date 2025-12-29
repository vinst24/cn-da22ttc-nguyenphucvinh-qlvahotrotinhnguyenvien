import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

// Routes
import adminRoutes from "./src/routes/admin.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import countryRouter from "./src/routes/country.routes.js";
import locationRoutes from "./src/routes/location.routes.js";
import organizationRoutes from "./src/routes/organization.routes.js";
import volunteerRoutes from "./src/routes/volunteer.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Chỉ cho phép localhost trong dev
    credentials: true // Cho phép gửi cookie (HTTP-only)
  })
);

app.use(express.json()); // Parse JSON body
app.use(cookieParser()); // Parse cookies
// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/countries", countryRouter);

// Debug middleware (tuỳ chọn)
app.use((req, res, next) => {
  console.log(`[DEBUG] Request URL: ${req.method} ${req.url}`);
  next();
});

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
