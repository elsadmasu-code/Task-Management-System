const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  DONE: 'done',
  CANCELLED: 'cancelled',
};

const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
};

const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on-hold',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_OVERDUE: 'task_overdue',
  COMMENT_ADDED: 'comment_added',
  COMMENT_MENTION: 'comment_mention',
  PROJECT_INVITE: 'project_invite',
  PROJECT_UPDATE: 'project_update',
  WORKSPACE_INVITE: 'workspace_invite',
  DEADLINE_REMINDER: 'deadline_reminder',
  GENERAL: 'general',
};

const DEFAULT_KANBAN_COLUMNS = [
  { id: 'todo', name: 'To Do', color: '#6366f1', order: 0 },
  { id: 'in-progress', name: 'In Progress', color: '#f59e0b', order: 1 },
  { id: 'review', name: 'Review', color: '#8b5cf6', order: 2 },
  { id: 'done', name: 'Done', color: '#10b981', order: 3 },
];

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  TASK_STATUS,
  TASK_PRIORITY,
  USER_ROLES,
  PROJECT_STATUS,
  NOTIFICATION_TYPES,
  DEFAULT_KANBAN_COLUMNS,
  PAGINATION,
};
