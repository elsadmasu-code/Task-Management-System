const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc   Get notifications for current user
// @route  GET /api/notifications
// @access Private
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query = { recipient: req.user._id };
  if (unreadOnly === 'true') query.isRead = false;

  const skip = (Number(page) - 1) * Number(limit);
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.json({ success: true, notifications, total, unreadCount, pages: Math.ceil(total / limit) });
});

// @desc   Mark notification as read
// @route  PUT /api/notifications/:id/read
// @access Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) { res.status(404); throw new Error('Notification not found'); }

  await notification.markAsRead();
  res.json({ success: true, notification });
});

// @desc   Mark all notifications as read
// @route  PUT /api/notifications/read-all
// @access Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  res.json({ success: true, message: 'All notifications marked as read' });
});

// @desc   Delete notification
// @route  DELETE /api/notifications/:id
// @access Private
const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  res.json({ success: true, message: 'Notification deleted' });
});

// @desc   Delete all read notifications
// @route  DELETE /api/notifications/clear-read
// @access Private
const clearReadNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id, isRead: true });
  res.json({ success: true, message: 'Read notifications cleared' });
});

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification, clearReadNotifications };
