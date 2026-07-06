export const validateCreateInstructor = (req, res, next) => {
  const { name, email, password, designation } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: "Password is required" });
  }

  if (!designation) {
    return res.status(400).json({ success: false, message: "Designation is required" });
  }

  next();
};

export const validateUpdateInstructor = (_req, _res, next) => {
  next();
};

export const validateInstructorStatus = (req, res, next) => {
  const { active } = req.body;

  if (typeof active !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Active must be true or false",
    });
  }

  next();
};