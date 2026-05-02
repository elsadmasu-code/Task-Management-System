const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const { notifyTaskOverdue } = require('../services/notification.service');
const { sendDeadlineReminderEmail } = require('../services/email.service');
const logger = require('../utils/logger');

// Run every day at 8:00 AM
const deadlineReminderJob = cron.schedule('0 8 * * *', async () => {
  logger.info('Running deadline reminder job...');
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Tasks due in next 24 hours
    const upcomingTasks = await Task.find({
      deadline: { $gte: now, $lte: in24h },
      status: { $nin: ['done', 'cancelled'] },
      isArchived: false,
    }).populate('assignedTo');

    for (const task of upcomingTasks) {
      for (const user of task.assignedTo) {
        try {
          await sendDeadlineReminderEmail(user, task);
        } catch (_) {}
      }
    }

    // Mark overdue tasks
    const overdueTasks = await Task.find({
      deadline: { $lt: now },
      status: { $nin: ['done', 'cancelled'] },
      isOverdue: false,
      isArchived: false,
    });

    for (const task of overdueTasks) {
      task.isOverdue = true;
      await task.save({ validateBeforeSave: false });
      await notifyTaskOverdue(task);
    }

    logger.info(`Deadline job: ${upcomingTasks.length} reminders sent, ${overdueTasks.length} tasks marked overdue`);
  } catch (error) {
    logger.error(`Deadline reminder job failed: ${error.message}`);
  }
}, { scheduled: false });

module.exports = deadlineReminderJob;
