import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Instructor from "../models/instructor.model.js";
import Role from "../models/role.model.js";
import "../models/batch.model.js";
export const createInstructor = async (data) => {
  const {
    name,
    email,
    mobileNo,
    password,
    designation,
    bio,
    linkedInUrl,
  } = data;

  // Check existing email
  const existingEmail = await User.findOne({ email });

  if (existingEmail) {
    throw new Error("Email already exists");
  }

  // Generate temporary mobile number if not provided
  const finalMobileNo = mobileNo || `${Date.now()}`;

  // Check existing mobile
  const existingMobile = await User.findOne({
    mobileNo: finalMobileNo,
  });

  if (existingMobile) {
    throw new Error("Mobile number already exists");
  }

  // Find or create Instructor Role
  let instructorRole = await Role.findOne({ name: "Instructor" });

  if (!instructorRole) {
    instructorRole = await Role.create({
      name: "Instructor",
      description: "Instructor role",
      permissionIds: [],
    });
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create User
  const user = await User.create({
    name,
    email,
    mobileNo: finalMobileNo,
    password: hashedPassword,
    roleId: instructorRole._id,
    profileStatus: "Active",
  });

  // Create Instructor
  const instructor = await Instructor.create({
    userId: user._id,
    designation,
    bio,
    linkedInUrl,
  });

  const { password: _, ...safeUser } = user.toObject();

  return {
    user: safeUser,
    instructor,
  };
};



//Get All Instructors
export const getAllInstructors = async () => {
  const instructors = await Instructor.find()
    .populate({
      path: "userId",
      select: "-password",
    });

  return instructors;
};

//Get Instructor By Id

export const getInstructorById = async (id) => {
  const instructor = await Instructor.findById(id).populate({
    path: "userId",
    select: "-password",
  });

  if (!instructor) {
    throw new Error("Instructor not found");
  }

  return instructor;
};

//Update Instructor
export const updateInstructor = async (id, data) => {
  const instructor = await Instructor.findById(id);

  if (!instructor) {
    throw new Error("Instructor not found");
  }

  await User.findByIdAndUpdate(
    instructor.userId,
    {
      name: data.name,
      email: data.email,
      mobileNo: data.mobileNo,
    },
    {
      new: true,
    }
  );

  instructor.designation = data.designation;
  instructor.bio = data.bio;
  instructor.linkedInUrl = data.linkedInUrl;

  if (data.assignedBatches) {
    instructor.assignedBatches = data.assignedBatches;
  }

  await instructor.save();

  return await Instructor.findById(id).populate({
    path: "userId",
    select: "-password",
  });
};

//Activate / Deactivate Instructor
export const updateInstructorStatus = async (id, active) => {
  const instructor = await Instructor.findById(id);

  if (!instructor) {
    throw new Error("Instructor not found");
  }

  const profileStatus = active ? "Active" : "Inactive";

  return await User.findByIdAndUpdate(
    instructor.userId,
    {
      profileStatus,
    },
    {
      new: true,
      select: "-password",
    }
  );
};