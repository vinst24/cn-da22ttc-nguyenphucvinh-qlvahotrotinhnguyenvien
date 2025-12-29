import express from "express";
import {
    getCommunesByProvince,
    getProvinces
} from "../controllers/location.controller.js";

const router = express.Router();

router.get("/provinces", getProvinces);
router.get("/provinces/:id/communes", getCommunesByProvince);

export default router;
