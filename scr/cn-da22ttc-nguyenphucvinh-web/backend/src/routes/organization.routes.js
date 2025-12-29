import express from "express";
import {
  createOrganizationEvent,
  deleteOrganizationEvent,
  getEventParticipants,
  getMonthlyEventsStats,
  getMonthlyVolunteerStats,
  getOrganization,
  getOrganizationEventById,
  getOrganizationEvents,
  getOrganizationStats,
  getOrganizationVolunteers,
  getRecentActivities,
  updateOrganization,
  updateOrganizationEvent
} from "../controllers/organization.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= ORG ONLY ================= */

router.get("/stats", authenticate, requireRole("ORG"), getOrganizationStats);
router.get(
  "/recent-activities",
  authenticate,
  requireRole("ORG"),
  getRecentActivities
);

// EVENTS (ORG CRUD)
router.get("/events", authenticate, requireRole("ORG"), getOrganizationEvents);
router.post(
  "/events",
  authenticate,
  requireRole("ORG"),
  createOrganizationEvent
);
router.get(
  "/events/:id",
  authenticate,
  requireRole("ORG"),
  getOrganizationEventById
);
router.put(
  "/events/:id",
  authenticate,
  requireRole("ORG"),
  updateOrganizationEvent
);
router.delete(
  "/events/:id",
  authenticate,
  requireRole("ORG"),
  deleteOrganizationEvent
);
router.get(
  "/stats/monthly-events",
  authenticate,
  requireRole("ORG"),
  getMonthlyEventsStats
);

router.get(
  "/stats/monthly-volunteers",
  authenticate,
  requireRole("ORG"),
  getMonthlyVolunteerStats
);

router.get(
  "/volunteers",
  authenticate,
  requireRole("ORG"),
  getOrganizationVolunteers
);

router.get(
  "/events/:id/participants",
  authenticate,
  requireRole("ORG"),
  getEventParticipants
);


/* ================= ADMIN ================= */

router.get("/:id", authenticate, getOrganization);
router.put("/:id", authenticate, requireRole("ADMIN"), updateOrganization);

export default router;
