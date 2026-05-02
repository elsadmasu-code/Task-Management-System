const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: { type: String, maxlength: 1000, default: '' },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member'],
          default: 'member',
        },
      },
    ],
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed', 'archived'],
      default: 'active',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '📁' },
    startDate: { type: Date },
    endDate: { type: Date },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    tags: [{ type: String, trim: true }],
    columns: [
      {
        id: String,
        name: String,
        color: String,
        order: Number,
      },
    ],
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: task count
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true,
});

projectSchema.index({ workspace: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Project', projectSchema);
