const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

// @desc   Send message (project group chat)
// @route  POST /api/chat/messages
// @access Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content, project, receiver, type = 'text' } = req.body;

  if (!content?.trim()) { res.status(400); throw new Error('Message content required'); }
  if (!project && !receiver) { res.status(400); throw new Error('Project or receiver required'); }

  const message = await Message.create({
    sender: req.user._id,
    content: content.trim(),
    project: project || null,
    receiver: receiver || null,
    type,
  });

  const populated = await Message.findById(message._id).populate('sender', 'name email avatar');

  // Emit real-time
  try {
    const { getIO } = require('../config/socket');
    const room = project || receiver;
    getIO().to(room.toString()).emit('message:new', populated);
  } catch (_) {}

  res.status(201).json({ success: true, message: populated });
});

// @desc   Get project messages
// @route  GET /api/chat/messages?project=id
// @access Private
const getMessages = asyncHandler(async (req, res) => {
  const { project, receiver, page = 1, limit = 50 } = req.query;

  const query = { isDeleted: false };
  if (project) query.project = project;
  else if (receiver) {
    query.$or = [
      { sender: req.user._id, receiver },
      { sender: receiver, receiver: req.user._id },
    ];
  } else {
    res.status(400); throw new Error('project or receiver required');
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [messages, total] = await Promise.all([
    Message.find(query)
      .populate('sender', 'name email avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Message.countDocuments(query),
  ]);

  res.json({ success: true, messages: messages.reverse(), total, pages: Math.ceil(total / limit) });
});

// @desc   Edit message
// @route  PUT /api/chat/messages/:id
// @access Private
const editMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) { res.status(404); throw new Error('Message not found'); }
  if (message.sender.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Permission denied'); }

  message.content = req.body.content;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  res.json({ success: true, message });
});

// @desc   Delete message (soft)
// @route  DELETE /api/chat/messages/:id
// @access Private
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) { res.status(404); throw new Error('Message not found'); }
  if (message.sender.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Permission denied'); }

  message.isDeleted = true;
  message.content = 'This message was deleted';
  await message.save();

  res.json({ success: true, message: 'Message deleted' });
});

// @desc   Mark messages as read
// @route  POST /api/chat/messages/read
// @access Private
const markAsRead = asyncHandler(async (req, res) => {
  const { project, receiver } = req.body;
  const query = { isDeleted: false, 'readBy.user': { $ne: req.user._id } };
  if (project) query.project = project;
  else if (receiver) query.sender = receiver;

  await Message.updateMany(query, {
    $addToSet: { readBy: { user: req.user._id, readAt: new Date() } },
  });

  res.json({ success: true, message: 'Messages marked as read' });
});

// @desc   Get unread count
// @route  GET /api/chat/unread
// @access Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    receiver: req.user._id,
    isDeleted: false,
    'readBy.user': { $ne: req.user._id },
  });

  res.json({ success: true, count });
});

module.exports = { sendMessage, getMessages, editMessage, deleteMessage, markAsRead, getUnreadCount };
