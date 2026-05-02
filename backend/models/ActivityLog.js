const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'created_task',
        'updated_task',
        'deleted_task',
        'moved_task',
        'assigned_task',
        'completed_task',
        'added_comment',
        'deleted_comment',
        'created_project',
        'updated_project',
        'deleted_project',
        'added_member',
        'removed_member',
        'created_workspace',
        'updated_workspace',
        'uploaded_file',
        'logged_in',
        'logged_out',
      ],
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetType: {
      type: String,
      required: true,
      enum: ['task', 'project', 'comment', 'workspace', 'user', 'message'],
    },
    targetTitle: { type: String, default: '' },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ workspace: 1, createdAt: -1 });
activityLogSchema.index({ project: 1, createdAt: -1 });
activityLogSchema.index({ targetId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
