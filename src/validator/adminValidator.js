import { CustomError } from '../../utils/customError.js';
import { isEmptyValue } from '../../utils/commonFunctions.js';

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDate(value) {
    return !Number.isNaN(new Date(value).getTime());
}

function validateStudentPayload(student, prefix = '') {
    if (isEmptyValue(student.name)) throw new CustomError(`${prefix}name is required`, 400);
    if (isEmptyValue(student.email)) throw new CustomError(`${prefix}email is required`, 400);
    if (!isValidEmail(student.email)) throw new CustomError(`${prefix}email is invalid`, 400);
    if (isEmptyValue(student.password)) throw new CustomError(`${prefix}password is required`, 400);
    if (student.password.length < 6) throw new CustomError(`${prefix}password must be at least 6 characters`, 400);
    if (isEmptyValue(student.mobileNo)) throw new CustomError(`${prefix}mobileNo is required`, 400);
    if (isEmptyValue(student.enrollementNo)) throw new CustomError(`${prefix}enrollementNo is required`, 400);
    if (isEmptyValue(student.dob)) throw new CustomError(`${prefix}dob is required`, 400);
    if (!isValidDate(student.dob)) throw new CustomError(`${prefix}dob is invalid`, 400);
}

export function validateCreateStudent(req, _res, next) {
    validateStudentPayload(req.body);
    next();
}

export function validateBulkCreateStudents(req, _res, next) {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
        throw new CustomError('students must be a non-empty array', 400);
    }

    for (let index = 0; index < students.length; index += 1) {
        validateStudentPayload(students[index], `students[${index}].`);
    }

    next();
}

export function validateUpdateStudent(req, _res, next) {
    const {
        email,
        password,
        mobileNo,
        enrollementNo,
        dob,
    } = req.body;

    if (email !== undefined && !isValidEmail(email)) {
        throw new CustomError('Invalid email format', 400);
    }

    if (password !== undefined && password.length < 6) {
        throw new CustomError('Password must be at least 6 characters', 400);
    }

    if (mobileNo !== undefined && isEmptyValue(mobileNo)) {
        throw new CustomError('Mobile number cannot be empty', 400);
    }

    if (enrollementNo !== undefined && isEmptyValue(enrollementNo)) {
        throw new CustomError('Enrollment number cannot be empty', 400);
    }

    if (dob !== undefined && !isValidDate(dob)) {
        throw new CustomError('Invalid date of birth', 400);
    }

    next();
}

export function validateUpdateStudentStatus(req, _res, next) {
    const { profileStatus } = req.body;
    const allowedStatus = ['Active', 'Inactive', 'blocked'];

    if (isEmptyValue(profileStatus)) throw new CustomError('profileStatus is required', 400);
    if (!allowedStatus.includes(profileStatus)) throw new CustomError('Invalid profile status', 400);

    next();
}

export function validateMoveStudentToBatch(req, _res, next) {
    const { newBatchId } = req.body;

    if (isEmptyValue(newBatchId)) throw new CustomError('newBatchId is required', 400);

    next();
}

export function validateCreateBatch(req, _res, next) {
    const { name, startDate, endDate, teacherIds, studentIds } = req.body;

    if (isEmptyValue(name)) throw new CustomError('Batch name is required', 400);

    if (startDate && !isValidDate(startDate)) {
        throw new CustomError('Invalid start date', 400);
    }

    if (endDate && !isValidDate(endDate)) {
        throw new CustomError('Invalid end date', 400);
    }

    if (teacherIds !== undefined && !Array.isArray(teacherIds)) {
        throw new CustomError('teacherIds must be an array', 400);
    }

    if (studentIds !== undefined && !Array.isArray(studentIds)) {
        throw new CustomError('studentIds must be an array', 400);
    }

    next();
}

export function validateUpdateBatch(req, _res, next) {
    const { name, startDate, endDate, teacherIds, studentIds } = req.body;

    if (name !== undefined && isEmptyValue(name)) {
        throw new CustomError('Batch name cannot be empty', 400);
    }

    if (startDate !== undefined && startDate !== null && !isValidDate(startDate)) {
        throw new CustomError('Invalid start date', 400);
    }

    if (endDate !== undefined && endDate !== null && !isValidDate(endDate)) {
        throw new CustomError('Invalid end date', 400);
    }

    if (teacherIds !== undefined && !Array.isArray(teacherIds)) {
        throw new CustomError('teacherIds must be an array', 400);
    }

    if (studentIds !== undefined && !Array.isArray(studentIds)) {
        throw new CustomError('studentIds must be an array', 400);
    }

    next();
}

export function validateUpdateBatchConfig(req, _res, next) {
    const { reason, markCap } = req.body;

    if (isEmptyValue(reason)) throw new CustomError('Reason is required', 400);
    if (reason.trim().length < 20) throw new CustomError('Reason must be at least 20 characters', 400);

    if (markCap !== undefined && Number(markCap) <= 0) {
        throw new CustomError('markCap must be greater than 0', 400);
    }

    next();
}

export function validateAssignTeachersToBatch(req, _res, next) {
    const { teacherIds } = req.body;

    if (!Array.isArray(teacherIds)) {
        throw new CustomError('teacherIds must be an array', 400);
    }

    next();
}