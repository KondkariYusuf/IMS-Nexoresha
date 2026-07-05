export const validateCreateInstructor = (req, res, next) => {
  const {
    name,
    email,
    mobileNo,
    password,
    designation,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!mobileNo) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  if (!designation) {
    return res.status(400).json({
      success: false,
      message: "Designation is required",
    });
  }

  next();
};

export const validateUpdateInstructor = (req, res, next) => {
  next();
};

export const validateInstructorStatus = (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  if (!["Active", "Inactive", "blocked"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  }

  next();
};