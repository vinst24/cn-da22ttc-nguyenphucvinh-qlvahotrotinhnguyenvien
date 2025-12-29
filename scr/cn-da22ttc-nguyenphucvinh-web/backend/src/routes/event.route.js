import express from "express";
import { joinEvent } from "../controllers/eventJoin.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Volunteer tham gia hoạt động
router.post(
  "/events/:id/join",
  authenticate,
  requireRole("MEMBER"),
  joinEvent
);

export default router;
