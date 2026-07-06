import { CustomError } from "../../utils/customError.js";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const validateCreateInstructor = (req, _res, next) => {
  const { name, email, password, designation } = req.body;

  if (!name) {
    throw new CustomError("Name is required", 400);
  }

  if (!email) {
    throw new CustomError("Email is required", 400);
  }

  if (!isValidEmail(email)) {
    throw new CustomError("Invalid email format", 400);
  }

  if (!password) {
    throw new CustomError("Password is required", 400);
  }

  if (password.length < 6) {
    throw new CustomError("Password must be at least 6 characters", 400);
  }

  if (!designation) {
    throw new CustomError("Designation is required", 400);
  }

  next();
};

export const validateUpdateInstructor = (_req, _res, next) => {
  next();
};

export const validateInstructorStatus = (req, _res, next) => {
  const { active } = req.body;

  if (typeof active !== "boolean") {
    throw new CustomError("Active must be true or false", 400);
  }

  next();
};