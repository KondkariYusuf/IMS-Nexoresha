import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import quizRoutes from "./quizRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/quiz", quizRoutes);

export default router;