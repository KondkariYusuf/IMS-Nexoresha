import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import Instructor from '../models/instructor.model.js';
import Role from '../models/role.model.js';
import { CustomError } from '../../utils/customError.js';

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

  const existingEmail = await User.findOne({ email });

  if (existingEmail) {
    throw new CustomError('Email already exists', 409);
  }

  const existingMobile = await User.findOne({ mobileNo });

  if (existingMobile) {
    throw new CustomError('Mobile number already exists', 409);
  }

  let instructorRole = await Role.findOne({ name: 'Instructor' });

  if (!instructorRole) {
    instructorRole = await Role.create({
      name: 'Instructor',
      description: 'Instructor role',
      permissionIds: [],
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    mobileNo,
    password: hashedPassword,
    roleId: instructorRole._id,
    profileStatus: 'Active',
  });

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

export const getAllInstructors = async () => {
  return Instructor.find().populate({
    path: 'userId',
    select: '-password',
  });
};

export const getInstructorById = async (id) => {
  const instructor = await Instructor.findById(id).populate({
    path: 'userId',
    select: '-password',
  });

  if (!instructor) {
    throw new CustomError('Instructor not found', 404);
  }

  return instructor;
};

export const updateInstructor = async (id, data) => {
  const instructor = await Instructor.findById(id);

  if (!instructor) {
    throw new CustomError('Instructor not found', 404);
  }

  const user = await User.findById(instructor.userId);

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  if (data.email && data.email !== user.email) {
    const existingEmail = await User.findOne({
      email: data.email,
      _id: { $ne: user._id },
    });

    if (existingEmail) {
      throw new CustomError('Email already exists', 409);
    }

    user.email = data.email;
  }

  if (data.mobileNo && data.mobileNo !== user.mobileNo) {
    const existingMobile = await User.findOne({
      mobileNo: data.mobileNo,
      _id: { $ne: user._id },
    });

    if (existingMobile) {
      throw new CustomError('Mobile number already exists', 409);
    }

    user.mobileNo = data.mobileNo;
  }

  if (data.name !== undefined) user.name = data.name;
  if (data.designation !== undefined) instructor.designation = data.designation;
  if (data.bio !== undefined) instructor.bio = data.bio;
  if (data.linkedInUrl !== undefined) instructor.linkedInUrl = data.linkedInUrl;
  if (data.profileImage !== undefined) instructor.profileImage = data.profileImage;

  if (data.assignedBatches !== undefined) {
    if (!Array.isArray(data.assignedBatches)) {
      throw new CustomError('assignedBatches must be an array', 400);
    }

    instructor.assignedBatches = data.assignedBatches;
  }

  await user.save();
  await instructor.save();

  return Instructor.findById(id).populate({
    path: 'userId',
    select: '-password',
  });
};

export const updateInstructorStatus = async (id, active) => {
  const instructor = await Instructor.findById(id);

  if (!instructor) {
    throw new CustomError('Instructor not found', 404);
  }

  const profileStatus = active ? 'Active' : 'Inactive';

  const user = await User.findByIdAndUpdate(
    instructor.userId,
    { profileStatus },
    {
      new: true,
      select: '-password',
    },
  );

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  return user;
};