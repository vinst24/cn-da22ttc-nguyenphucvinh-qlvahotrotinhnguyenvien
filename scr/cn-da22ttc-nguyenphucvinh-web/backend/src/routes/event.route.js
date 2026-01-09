import express from "express";
import { joinEvent } from "../controllers/eventJoin.controller.js";
import { getEventDetail } from "../controllers/volunteer.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get event details (public or authenticated)
router.get("/:id", authenticate, getEventDetail);

// Volunteer tham gia hoạt động
router.post(
  "/:id/join",
  authenticate,
  requireRole("MEMBER"),
  joinEvent
);

export default router;
