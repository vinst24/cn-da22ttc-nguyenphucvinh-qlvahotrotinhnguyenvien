import express from "express";
import { listCountries } from "../controllers/country.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, listCountries);

export default router;
