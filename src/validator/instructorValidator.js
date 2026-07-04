import { body, param } from 'express-validator';
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

export const createCourseValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Course name is required')
    .isLength({ max: 200 })
    .withMessage('Course name cannot exceed 200 characters'),
  body('instructorIds')
    .optional()
    .isArray()
    .withMessage('instructorIds must be an array of instructor UUIDs'),
  body('instructorIds.*')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Instructor ID must be a non-empty string'),
  handleValidationErrors,
];

export const createTopicValidator = [
  body('batchId')
    .trim()
    .notEmpty()
    .withMessage('batchId is required')
    .isString()
    .withMessage('batchId must be a string'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Topic title is required')
    .isLength({ max: 120 })
    .withMessage('Topic title cannot exceed 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Topic description (rich text HTML) is required'),
  body('learningObjectives')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value; // Keep value so validation fails if not array-like
        }
      }
      return value;
    })
    .isArray({ min: 1, max: 10 })
    .withMessage('learningObjectives must be an array with 1 to 10 objectives'),
  body('learningObjectives.*')
    .trim()
    .notEmpty()
    .withMessage('Each learning objective must be a non-empty string'),
  body('estimatedHours')
    .notEmpty()
    .withMessage('estimatedHours is required')
    .isFloat({ min: 0 })
    .withMessage('estimatedHours must be a non-negative number'),
  body('orderIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('orderIndex must be a non-negative integer'),
  handleValidationErrors,
];

export const updateTopicValidator = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Topic ID parameter is required'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Topic title cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Topic title cannot exceed 120 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Topic description cannot be empty'),
  body('learningObjectives')
    .optional()
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
      return value;
    })
    .isArray({ min: 1, max: 10 })
    .withMessage('learningObjectives must contain between 1 and 10 objectives'),
  body('learningObjectives.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Each learning objective must be a non-empty string'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('estimatedHours must be a non-negative number'),
  handleValidationErrors,
];

export const reorderTopicsValidator = [
  body('topicIds')
    .isArray({ min: 1 })
    .withMessage('topicIds must be a non-empty array of topic UUIDs'),
  body('topicIds.*')
    .trim()
    .notEmpty()
    .withMessage('Each topicId must be a non-empty string'),
  handleValidationErrors,
];
