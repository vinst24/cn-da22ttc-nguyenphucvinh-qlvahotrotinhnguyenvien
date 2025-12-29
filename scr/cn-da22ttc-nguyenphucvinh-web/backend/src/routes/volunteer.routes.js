// routes/volunteer.routes.js
import express from "express";
import multer from "multer";
import {
  changePassword,
  getAvailableEvents,
  getNotifications,
  getRegisteredEvents,
  getVolunteer,
  registerEvent,
  updateVolunteer,
  uploadAvatar
} from "../controllers/volunteer.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${unique}.${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  }
});

/* ================= ROUTES (THỨ TỰ QUAN TRỌNG) ================= */

// EVENT
router.get("/available", verifyToken, getAvailableEvents);
router.post("/register-event/:id", verifyToken, registerEvent);

// PROFILE
router.get("/:id", verifyToken, getVolunteer);
router.put("/:id", verifyToken, updateVolunteer);
router.put("/:id/change-password", verifyToken, changePassword);
router.post("/:id/avatar", verifyToken, upload.single("avatar"), uploadAvatar);
router.get("/:id/events", verifyToken, getRegisteredEvents);
router.get("/:id/notifications", verifyToken, getNotifications);

export default router;
