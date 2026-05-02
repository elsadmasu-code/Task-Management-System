const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { logActivity } = require('../services/activity.service');
const { notifyTaskAssigned } = require('../services/notification.service');
const { sendTaskAssignedEmail } = require('../services/email.service');

// @desc   Create task
// @route  POST /api/tasks
// @access Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, project, workspace, status, priority, assignedTo, deadline, columnId, tags, estimatedHours } = req.body;

  const task = await Task.create({
    title, description, project, workspace,
    createdBy: req.user._id,
    status: status || 'todo',
    priority: priority || 'medium',
    assignedTo: assignedTo || [],
    deadline, columnId: columnId || status || 'todo',
    tags, estimatedHours,
  });

  // Notify assigned users
  if (assignedTo?.length) {
    const [assignees, assigner] = await Promise.all([
      User.find({ _id: { $in: assignedTo } }),
      User.findById(req.user._id),
    ]);
    for (const assignee of assignees) {
      if (assignee._id.toString() !== req.user._id.toString()) {
        notifyTaskAssigned(task, assignee, assigner).catch(() => {});
        sendTaskAssignedEmail(assignee, task, assigner).catch(() => {});
      }
    }
  }

  await logActivity({ user: req.user._id, action: 'created_task', targetId: task._id, targetType: 'task', targetTitle: task.title, workspace, project });

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  res.status(201).json({ success: true, task: populated });
});

// @desc   Get tasks (with filters)
// @route  GET /api/tasks?project=&status=&assignedTo=&priority=
// @access Private
const getTasks = asyncHandler(async (req, res) => {
  const { project, workspace, status, priority, assignedTo, search, page = 1, limit = 50, sortBy = 'order', sortOrder = 'asc' } = req.query;

  const query = { isArchived: false };
  if (project) query.project = project;
  if (workspace) query.workspace = workspace;
  if (status) query.status = { $in: status.split(',') };
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (search) query.title = { $regex: search, $options: 'i' };

  const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  const skip = (Number(page) - 1) * Number(limit);

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort(sortObj).skip(skip).limit(Number(limit)),
    Task.countDocuments(query),
  ]);

  res.json({ success: true, tasks, total, pages: Math.ceil(total / limit) });
});

// @desc   Get single task
// @route  GET /api/tasks/:id
// @access Private
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name color')
    .populate('commentCount');

  if (!task) { res.status(404); throw new Error('Task not found'); }
  res.json({ success: true, task });
});

// @desc   Update task
// @route  PUT /api/tasks/:id
// @access Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }

  const prevStatus = task.status;
  const updatable = ['title', 'description', 'status', 'priority', 'assignedTo', 'deadline', 'columnId', 'order', 'tags', 'estimatedHours', 'loggedHours', 'checklist', 'startDate'];
  updatable.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });

  await task.save();

  const action = prevStatus !== task.status ? 'moved_task' : 'updated_task';
  await logActivity({
    user: req.user._id, action, targetId: task._id, targetType: 'task',
    targetTitle: task.title, project: task.project, workspace: task.workspace,
    meta: prevStatus !== task.status ? { from: prevStatus, to: task.status } : {},
  });

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  // Emit real-time update
  try {
    const { getIO } = require('../config/socket');
    getIO().to(task.project.toString()).emit('task:updated', populated);
  } catch (_) {}

  res.json({ success: true, task: populated });
});

// @desc   Delete task
// @route  DELETE /api/tasks/:id
// @access Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }

  const isCreator = task.createdBy.toString() === req.user._id.toString();
  if (!isCreator && req.user.role !== 'admin') { res.status(403); throw new Error('Permission denied'); }

  await task.deleteOne();
  await logActivity({ user: req.user._id, action: 'deleted_task', targetId: task._id, targetType: 'task', targetTitle: task.title, project: task.project });

  res.json({ success: true, message: 'Task deleted' });
});

// @desc   Bulk update tasks (for Kanban drag & drop)
// @route  PUT /api/tasks/bulk-update
// @access Private
const bulkUpdateTasks = asyncHandler(async (req, res) => {
  const { tasks } = req.body; // [{ _id, status, columnId, order }]
  if (!Array.isArray(tasks)) { res.status(400); throw new Error('tasks must be an array'); }

  const ops = tasks.map(t => ({
    updateOne: {
      filter: { _id: t._id },
      update: { $set: { status: t.status, columnId: t.columnId, order: t.order } },
    },
  }));

  await Task.bulkWrite(ops);
  res.json({ success: true, message: 'Tasks updated' });
});

// @desc   Get my tasks
// @route  GET /api/tasks/my-tasks
// @access Private
const getMyTasks = asyncHandler(async (req, res) => {
  const { status, priority } = req.query;
  const query = { assignedTo: req.user._id, isArchived: false };
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const tasks = await Task.find(query)
    .populate('project', 'name color')
    .populate('assignedTo', 'name avatar')
    .sort({ deadline: 1, priority: -1 });

  res.json({ success: true, tasks });
});

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, bulkUpdateTasks, getMyTasks };
