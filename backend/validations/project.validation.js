const { body } = require('express-validator');
const { handleValidation } = require('./auth.validation');
const { PROJECT_STATUS, TASK_PRIORITY } = require('../utils/constants');

const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('workspace')
    .notEmpty().withMessage('Workspace is required')
    .isMongoId().withMessage('Invalid workspace ID'),
  body('status')
    .optional()
    .isIn(Object.values(PROJECT_STATUS)).withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(Object.values(TASK_PRIORITY)).withMessage('Invalid priority'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  handleValidation,
];

const updateProjectValidation = [
  body('name').optional().trim().isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('status').optional().isIn(Object.values(PROJECT_STATUS)).withMessage('Invalid status'),
  handleValidation,
];

module.exports = { createProjectValidation, updateProjectValidation };
