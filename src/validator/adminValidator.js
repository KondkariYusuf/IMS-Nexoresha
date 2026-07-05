import { CustomError } from '../../utils/customError.js';
import { isEmptyValue } from '../../utils/commonFunctions.js';

export function validateCreateStudent(req, _res, next) {
    const { name, email, password } = req.body;

    if (isEmptyValue(name)) {
        throw new CustomError('Name is required', 400);
    }

    if (isEmptyValue(email)) {
        throw new CustomError('Email is required', 400);
    }

    if (isEmptyValue(password)) {
        throw new CustomError('Password is required', 400);
    }

    next();
}