const { body } = require('express-validator');
const { handleValidation } = require('./auth.validation');
const { TASK_STATUS, TASK_PRIORITY } = require('../utils/constants');

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('project').notEmpty().withMessage('Project is required').isMongoId().withMessage('Invalid project ID'),
  body('workspace').notEmpty().withMessage('Workspace is required').isMongoId().withMessage('Invalid workspace ID'),
  body('status')
    .optional()
    .isIn(Object.values(TASK_STATUS)).withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(Object.values(TASK_PRIORITY)).withMessage('Invalid priority'),
  body('deadline').optional().isISO8601().withMessage('Invalid deadline date'),
  handleValidation,
];

const updateTaskValidation = [
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('status').optional().isIn(Object.values(TASK_STATUS)).withMessage('Invalid status'),
  body('priority').optional().isIn(Object.values(TASK_PRIORITY)).withMessage('Invalid priority'),
  body('deadline').optional().isISO8601().withMessage('Invalid deadline date'),
  handleValidation,
];

module.exports = { createTaskValidation, updateTaskValidation };
