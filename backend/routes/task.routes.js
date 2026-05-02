const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTask, updateTask, deleteTask, bulkUpdateTasks, getMyTasks } = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const { createTaskValidation, updateTaskValidation } = require('../validations/task.validation');

router.use(protect);

router.get('/my-tasks', getMyTasks);
router.put('/bulk-update', bulkUpdateTasks);
router.route('/').get(getTasks).post(createTaskValidation, createTask);
router.route('/:id').get(getTask).put(updateTaskValidation, updateTask).delete(deleteTask);

module.exports = router;
