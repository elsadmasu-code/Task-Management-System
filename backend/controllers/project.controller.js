const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { logActivity } = require('../services/activity.service');
const { notifyProjectInvite } = require('../services/notification.service');
const { DEFAULT_KANBAN_COLUMNS } = require('../utils/constants');
const User = require('../models/User');

// @desc   Create project
// @route  POST /api/projects
// @access Private
const createProject = asyncHandler(async (req, res) => {
  const { name, description, workspace, startDate, endDate, priority, color, icon } = req.body;

  const project = await Project.create({
    name, description, workspace,
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: 'owner' }],
    startDate, endDate, priority, color, icon,
    columns: DEFAULT_KANBAN_COLUMNS,
  });

  await logActivity({ user: req.user._id, action: 'created_project', targetId: project._id, targetType: 'project', targetTitle: project.name, workspace, project: project._id });

  res.status(201).json({ success: true, project });
});

// @desc   Get workspace projects
// @route  GET /api/projects?workspace=id
// @access Private
const getProjects = asyncHandler(async (req, res) => {
  const { workspace, status, page = 1, limit = 20 } = req.query;
  const query = {
    isArchived: false,
    $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }],
  };

  if (workspace) query.workspace = workspace;
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('taskCount')
      .skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Project.countDocuments(query),
  ]);

  res.json({ success: true, projects, total, pages: Math.ceil(total / limit) });
});

// @desc   Get single project
// @route  GET /api/projects/:id
// @access Private
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('workspace', 'name');

  if (!project) { res.status(404); throw new Error('Project not found'); }

  const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
  if (!isMember) { res.status(403); throw new Error('Access denied'); }

  // Task stats
  const taskStats = await Task.aggregate([
    { $match: { project: project._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({ success: true, project, taskStats });
});

// @desc   Update project
// @route  PUT /api/projects/:id
// @access Private
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404); throw new Error('Project not found'); }

  const member = project.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member || !['owner', 'admin'].includes(member.role)) { res.status(403); throw new Error('Permission denied'); }

  const fields = ['name', 'description', 'status', 'priority', 'color', 'icon', 'startDate', 'endDate', 'columns', 'tags'];
  fields.forEach(f => { if (req.body[f] !== undefined) project[f] = req.body[f]; });

  await project.save();
  await logActivity({ user: req.user._id, action: 'updated_project', targetId: project._id, targetType: 'project', targetTitle: project.name, project: project._id });

  res.json({ success: true, project });
});

// @desc   Add member to project
// @route  POST /api/projects/:id/members
// @access Private
const addProjectMember = asyncHandler(async (req, res) => {
  const { userId, role = 'member' } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404); throw new Error('Project not found'); }

  if (project.members.some(m => m.user.toString() === userId)) {
    res.status(400); throw new Error('User already in project');
  }

  project.members.push({ user: userId, role });
  await project.save();

  const [invitee, inviter] = await Promise.all([User.findById(userId), User.findById(req.user._id)]);
  notifyProjectInvite(project, invitee, inviter).catch(() => {});

  await logActivity({ user: req.user._id, action: 'added_member', targetId: userId, targetType: 'user', project: project._id });

  const updated = await Project.findById(project._id).populate('members.user', 'name email avatar');
  res.json({ success: true, project: updated });
});

// @desc   Remove member from project
// @route  DELETE /api/projects/:id/members/:userId
// @access Private
const removeProjectMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404); throw new Error('Project not found'); }

  project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
  await project.save();

  res.json({ success: true, message: 'Member removed from project' });
});

// @desc   Delete project
// @route  DELETE /api/projects/:id
// @access Private
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404); throw new Error('Project not found'); }
  if (project.createdBy.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Only creator can delete project'); }

  await Promise.all([project.deleteOne(), Task.deleteMany({ project: project._id })]);
  await logActivity({ user: req.user._id, action: 'deleted_project', targetId: project._id, targetType: 'project', targetTitle: project.name });

  res.json({ success: true, message: 'Project and its tasks deleted' });
});

module.exports = { createProject, getProjects, getProject, updateProject, addProjectMember, removeProjectMember, deleteProject };
