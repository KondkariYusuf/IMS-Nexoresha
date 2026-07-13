import express from "express";

import {
  createInstructor,
  getAllInstructors,
  getInstructorById,
  updateInstructor,
  updateInstructorStatus,
} from "../controller/instructor.controller.js";

import {
  validateCreateInstructor,
  validateUpdateInstructor,
  validateInstructorStatus,
} from "../validator/instructor.validator.js";

const router = express.Router();

// POST /api/v1/admin/teachers
router.post("/", validateCreateInstructor, createInstructor);

// GET /api/v1/admin/teachers
router.get("/", getAllInstructors);

// GET /api/v1/admin/teachers/:id
router.get("/:id", getInstructorById);

// PUT /api/v1/admin/teachers/:id
router.put("/:id", validateUpdateInstructor, updateInstructor);

// PATCH /api/v1/admin/teachers/:id/status
router.patch(
  "/:id/status",
  validateInstructorStatus,
  updateInstructorStatus
);
export default router;