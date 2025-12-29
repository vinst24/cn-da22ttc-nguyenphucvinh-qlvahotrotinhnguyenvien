import express from "express";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

// AUTH ROUTES
router.post("/register", authController.registerController);
router.post("/login", authController.loginController);
router.get("/verify-token", authController.verifyTokenController);
router.post("/refresh", authController.refreshController);
router.post("/logout", authController.logoutController);

export default router;
