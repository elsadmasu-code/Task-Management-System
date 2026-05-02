const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

const logActivity = async ({
  user,
  action,
  targetId,
  targetType,
  targetTitle = '',
  workspace,
  project,
  meta = {},
  ipAddress = '',
}) => {
  try {
    const log = await ActivityLog.create({
      user,
      action,
      targetId,
      targetType,
      targetTitle,
      workspace,
      project,
      meta,
      ipAddress,
    });
    return log;
  } catch (error) {
    logger.error(`Activity log error: ${error.message}`);
  }
};

const getProjectActivity = async (projectId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    ActivityLog.find({ project: projectId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments({ project: projectId }),
  ]);
  return { logs, total, pages: Math.ceil(total / limit) };
};

const getWorkspaceActivity = async (workspaceId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    ActivityLog.find({ workspace: workspaceId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments({ workspace: workspaceId }),
  ]);
  return { logs, total, pages: Math.ceil(total / limit) };
};

module.exports = { logActivity, getProjectActivity, getWorkspaceActivity };
