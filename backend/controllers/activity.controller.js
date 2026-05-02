const asyncHandler = require('express-async-handler');
const { getProjectActivity, getWorkspaceActivity } = require('../services/activity.service');
const ActivityLog = require('../models/ActivityLog');

// @desc   Get project activity
// @route  GET /api/activity/project/:projectId
// @access Private
const getProjectActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await getProjectActivity(req.params.projectId, Number(page), Number(limit));
  res.json({ success: true, ...result });
});

// @desc   Get workspace activity
// @route  GET /api/activity/workspace/:workspaceId
// @access Private
const getWorkspaceActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await getWorkspaceActivity(req.params.workspaceId, Number(page), Number(limit));
  res.json({ success: true, ...result });
});

// @desc   Get user activity
// @route  GET /api/activity/user
// @access Private
const getUserActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    ActivityLog.find({ user: req.user._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    ActivityLog.countDocuments({ user: req.user._id }),
  ]);

  res.json({ success: true, logs, total, pages: Math.ceil(total / limit) });
});

module.exports = { getProjectActivityLogs, getWorkspaceActivityLogs, getUserActivityLogs };
