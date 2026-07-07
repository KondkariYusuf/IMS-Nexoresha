import * as instructorService from "../service/instructor.service.js";

//Create Instructor
export const createInstructor = async (req, res, next) => {
  try {
    const result = await instructorService.createInstructor(req.body);

    res.status(201).json({
      success: true,
      message: "Instructor created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//Get All Instructors
export const getAllInstructors = async (req, res, next) => {
  try {
    const instructors = await instructorService.getAllInstructors();

    res.status(200).json({
      success: true,
      message: "Instructors fetched successfully",
      data: instructors,
    });
  } catch (error) {
    next(error);
  }
};

//Get Instructor By Id
export const getInstructorById = async (req, res, next) => {
  try {
    const result = await instructorService.getInstructorById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Instructor fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInstructor = async (req, res, next) => {
  try {
    const result = await instructorService.updateInstructor(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Instructor updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

//Activate / Deactivate Instructor
export const updateInstructorStatus = async (req, res, next) => {
  try {
    const result = await instructorService.updateInstructorStatus(
      req.params.id,
      req.body.active
    );

    res.status(200).json({
      success: true,
      message: "Instructor status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};