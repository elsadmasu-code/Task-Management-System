const Notification = require('../models/Notification');
const logger = require('../utils/logger');

let io;

const setIO = (socketIO) => {
  io = socketIO;
};

const createNotification = async ({
  recipient,
  sender,
  type,
  title,
  message,
  link = '',
  data = {},
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      data,
    });

    // Emit real-time notification
    if (io) {
      io.to(recipient.toString()).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    logger.error(`Failed to create notification: ${error.message}`);
  }
};

const notifyTaskAssigned = async (task, assignee, assigner) => {
  await createNotification({
    recipient: assignee._id,
    sender: assigner._id,
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: `${assigner.name} assigned you task: "${task.title}"`,
    link: `/projects/${task.project}/tasks/${task._id}`,
    data: { taskId: task._id, projectId: task.project },
  });
};

const notifyCommentAdded = async (comment, task, commenter, taskOwner) => {
  if (commenter._id.toString() === taskOwner._id.toString()) return;

  await createNotification({
    recipient: taskOwner._id,
    sender: commenter._id,
    type: 'comment_added',
    title: 'New Comment',
    message: `${commenter.name} commented on task: "${task.title}"`,
    link: `/projects/${task.project}/tasks/${task._id}`,
    data: { taskId: task._id, commentId: comment._id },
  });
};

const notifyTaskOverdue = async (task) => {
  for (const userId of task.assignedTo) {
    await createNotification({
      recipient: userId,
      type: 'task_overdue',
      title: 'Task Overdue',
      message: `Task "${task.title}" is overdue!`,
      link: `/projects/${task.project}/tasks/${task._id}`,
      data: { taskId: task._id },
    });
  }
};

const notifyProjectInvite = async (project, invitee, inviter) => {
  await createNotification({
    recipient: invitee._id,
    sender: inviter._id,
    type: 'project_invite',
    title: 'Project Invitation',
    message: `${inviter.name} added you to project: "${project.name}"`,
    link: `/projects/${project._id}`,
    data: { projectId: project._id },
  });
};

module.exports = {
  setIO,
  createNotification,
  notifyTaskAssigned,
  notifyCommentAdded,
  notifyTaskOverdue,
  notifyProjectInvite,
};
