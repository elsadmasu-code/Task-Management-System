const asyncHandler = require('express-async-handler');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');

// Check workspace role
const requireWorkspaceRole = (...roles) =>
  asyncHandler(async (req, res, next) => {
    const workspaceId = req.params.workspaceId || req.body.workspace;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    const isOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isOwner && (!member || !roles.includes(member.role))) {
      res.status(403);
      throw new Error('Insufficient workspace permissions');
    }

    req.workspace = workspace;
    next();
  });

// Check project role
const requireProjectRole = (...roles) =>
  asyncHandler(async (req, res, next) => {
    const projectId = req.params.projectId || req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    const isCreator = project.createdBy.toString() === req.user._id.toString();

    if (!isCreator && (!member || !roles.includes(member.role))) {
      res.status(403);
      throw new Error('Insufficient project permissions');
    }

    req.project = project;
    next();
  });

// System admin only
const requireAdmin = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Admin access required');
  }
  next();
});

module.exports = { requireWorkspaceRole, requireProjectRole, requireAdmin };
