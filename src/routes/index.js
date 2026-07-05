import express from "express";
import healthRoutes from "./healthRoutes.js";
import instructorRoutes from "./instructor.routes.js";

const router = express.Router();

router.use("/health", healthRoutes);

// Admin Routes
router.use("/v1/admin/teachers", instructorRoutes);

export default router;