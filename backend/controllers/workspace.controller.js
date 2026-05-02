const asyncHandler = require('express-async-handler');
const Workspace = require('../models/Workspace');
const { logActivity } = require('../services/activity.service');
const { DEFAULT_KANBAN_COLUMNS } = require('../utils/constants');

// @desc   Create workspace
// @route  POST /api/workspaces
// @access Private
const createWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const workspace = await Workspace.create({
    name,
    description,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'owner' }],
  });

  await logActivity({
    user: req.user._id,
    action: 'created_workspace',
    targetId: workspace._id,
    targetType: 'workspace',
    targetTitle: workspace.name,
    workspace: workspace._id,
  });

  res.status(201).json({ success: true, workspace });
});

// @desc   Get user workspaces
// @route  GET /api/workspaces
// @access Private
const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, workspaces });
});

// @desc   Get single workspace
// @route  GET /api/workspaces/:id
// @access Private
const getWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const isMember = workspace.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );
  const isOwner = workspace.owner._id.toString() === req.user._id.toString();

  if (!isMember && !isOwner) {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({ success: true, workspace });
});

// @desc   Update workspace
// @route  PUT /api/workspaces/:id
// @access Private
const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) { res.status(404); throw new Error('Workspace not found'); }

  const isOwnerOrAdmin = workspace.owner.toString() === req.user._id.toString() ||
    workspace.members.some(m => m.user.toString() === req.user._id.toString() && ['owner','admin'].includes(m.role));

  if (!isOwnerOrAdmin) { res.status(403); throw new Error('Permission denied'); }

  const { name, description, settings } = req.body;
  if (name) workspace.name = name;
  if (description !== undefined) workspace.description = description;
  if (settings) workspace.settings = { ...workspace.settings, ...settings };

  await workspace.save();
  await logActivity({ user: req.user._id, action: 'updated_workspace', targetId: workspace._id, targetType: 'workspace', targetTitle: workspace.name, workspace: workspace._id });

  res.json({ success: true, workspace });
});

// @desc   Add member to workspace
// @route  POST /api/workspaces/:id/members
// @access Private
const addMember = asyncHandler(async (req, res) => {
  const { userId, role = 'member' } = req.body;
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) { res.status(404); throw new Error('Workspace not found'); }

  const alreadyMember = workspace.members.some(m => m.user.toString() === userId);
  if (alreadyMember) { res.status(400); throw new Error('User is already a member'); }

  workspace.members.push({ user: userId, role });
  await workspace.save();

  await logActivity({ user: req.user._id, action: 'added_member', targetId: userId, targetType: 'user', workspace: workspace._id });

  const updated = await Workspace.findById(workspace._id).populate('members.user', 'name email avatar');
  res.json({ success: true, workspace: updated });
});

// @desc   Remove member
// @route  DELETE /api/workspaces/:id/members/:userId
// @access Private
const removeMember = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) { res.status(404); throw new Error('Workspace not found'); }

  workspace.members = workspace.members.filter(
    (m) => m.user.toString() !== req.params.userId
  );
  await workspace.save();

  await logActivity({ user: req.user._id, action: 'removed_member', targetId: req.params.userId, targetType: 'user', workspace: workspace._id });
  res.json({ success: true, message: 'Member removed' });
});

// @desc   Delete workspace
// @route  DELETE /api/workspaces/:id
// @access Private
const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) { res.status(404); throw new Error('Workspace not found'); }
  if (workspace.owner.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Only owner can delete workspace'); }

  await workspace.deleteOne();
  res.json({ success: true, message: 'Workspace deleted' });
});

module.exports = { createWorkspace, getWorkspaces, getWorkspace, updateWorkspace, addMember, removeMember, deleteWorkspace };
