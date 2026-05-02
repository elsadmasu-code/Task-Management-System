const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { logActivity } = require('../services/activity.service');
const { notifyCommentAdded } = require('../services/notification.service');
const User = require('../models/User');

// @desc   Add comment
// @route  POST /api/comments
// @access Private
const addComment = asyncHandler(async (req, res) => {
  const { task: taskId, text, parentComment } = req.body;

  const task = await Task.findById(taskId).populate('createdBy');
  if (!task) { res.status(404); throw new Error('Task not found'); }

  const comment = await Comment.create({
    task: taskId,
    user: req.user._id,
    text,
    parentComment: parentComment || null,
  });

  const populated = await Comment.findById(comment._id).populate('user', 'name email avatar');

  // Notify task owner
  notifyCommentAdded(comment, task, req.user, task.createdBy).catch(() => {});

  await logActivity({ user: req.user._id, action: 'added_comment', targetId: comment._id, targetType: 'comment', targetTitle: task.title, project: task.project });

  // Emit real-time
  try {
    const { getIO } = require('../config/socket');
    getIO().to(task.project.toString()).emit('comment:new', { taskId, comment: populated });
  } catch (_) {}

  res.status(201).json({ success: true, comment: populated });
});

// @desc   Get comments for a task
// @route  GET /api/comments?task=taskId
// @access Private
const getComments = asyncHandler(async (req, res) => {
  const { task, page = 1, limit = 20 } = req.query;
  if (!task) { res.status(400); throw new Error('Task ID required'); }

  const skip = (Number(page) - 1) * Number(limit);
  const [comments, total] = await Promise.all([
    Comment.find({ task, parentComment: null })
      .populate('user', 'name email avatar')
      .populate({ path: 'parentComment', populate: { path: 'user', select: 'name avatar' } })
      .sort({ createdAt: 1 }).skip(skip).limit(Number(limit)),
    Comment.countDocuments({ task }),
  ]);

  res.json({ success: true, comments, total, pages: Math.ceil(total / limit) });
});

// @desc   Update comment
// @route  PUT /api/comments/:id
// @access Private
const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }
  if (comment.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Permission denied'); }

  comment.text = req.body.text;
  comment.isEdited = true;
  comment.editedAt = new Date();
  await comment.save();

  const populated = await Comment.findById(comment._id).populate('user', 'name email avatar');
  res.json({ success: true, comment: populated });
});

// @desc   Delete comment
// @route  DELETE /api/comments/:id
// @access Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }

  const isOwner = comment.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') { res.status(403); throw new Error('Permission denied'); }

  await comment.deleteOne();
  res.json({ success: true, message: 'Comment deleted' });
});

// @desc   Add reaction to comment
// @route  POST /api/comments/:id/react
// @access Private
const reactToComment = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  const comment = await Comment.findById(req.params.id);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }

  const reactionIdx = comment.reactions.findIndex(r => r.emoji === emoji);
  if (reactionIdx === -1) {
    comment.reactions.push({ emoji, users: [req.user._id] });
  } else {
    const userIdx = comment.reactions[reactionIdx].users.indexOf(req.user._id);
    if (userIdx === -1) {
      comment.reactions[reactionIdx].users.push(req.user._id);
    } else {
      comment.reactions[reactionIdx].users.splice(userIdx, 1);
    }
  }

  await comment.save();
  res.json({ success: true, reactions: comment.reactions });
});

module.exports = { addComment, getComments, updateComment, deleteComment, reactToComment };
