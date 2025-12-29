import express from "express";
import {
  addOrganizationAccount,
  approveEvent,
  createOrganization,
  deleteOrganization,
  deleteOrganizationAccount,
  getActionStats,
  getAdmin,
  getEventsByMonth,
  getOrganizationDetail,
  getRecentEvents,
  getVolunteer,
  listEvents,
  listOrganizations,
  listVolunteers,
  statistics,
  toggleOrganizationAccountActive,
  toggleVolunteerActive,
  updateOrganization,
  updateVolunteer
} from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Volunteer
router.get("/volunteers", authenticate, listVolunteers);
router.get("/volunteer/:id", authenticate, getVolunteer);
router.put("/volunteer/:id", authenticate, updateVolunteer);
router.put("/volunteer/:id/toggle-active", authenticate, toggleVolunteerActive);

// Organization
router.get("/organizations", authenticate, listOrganizations);
router.post("/organizations", authenticate, createOrganization);
router.get("/organization/:id", authenticate, getOrganizationDetail);
router.put("/organization/:id", authenticate, updateOrganization);
router.delete("/organization/:id", authenticate, deleteOrganization);

// Organization account management
router.post("/organization/:id/accounts", authenticate, addOrganizationAccount);
router.put(
  "/account/:id/toggle-active",
  authenticate,
  toggleOrganizationAccountActive
);
router.delete("/account/:id", authenticate, deleteOrganizationAccount);

// Event
router.get("/events", authenticate, listEvents);
router.put("/events/:id/approve", authenticate, approveEvent);

// Stats
router.get("/statistics", authenticate, statistics);
router.get("/action-stats", authenticate, getActionStats);
router.get("/recent-events", authenticate, getRecentEvents);
router.get("/events-by-month", authenticate, getEventsByMonth);

// Single admin
router.get("/:id", authenticate, getAdmin);

export default router;
