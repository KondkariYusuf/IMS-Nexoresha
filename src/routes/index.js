import express from "express";
import healthRoutes from "./healthRoutes.js";
import instructorRoutes from "./instructor.routes.js";
import { Router } from 'express';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use("/health", healthRoutes);

// Admin Routes
router.use("/v1/admin/teachers", instructorRoutes);
router.use('/admin', adminRoutes);

export default router;