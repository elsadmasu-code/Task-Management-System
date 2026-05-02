const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: { type: String, maxlength: 5000, default: '' },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
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
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done', 'cancelled'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    columnId: { type: String, default: 'todo' },
    order: { type: Number, default: 0 },
    deadline: { type: Date },
    startDate: { type: Date },
    completedAt: { type: Date },
    estimatedHours: { type: Number, default: 0 },
    loggedHours: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    attachments: [
      {
        url: String,
        publicId: String,
        filename: String,
        fileType: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    checklist: [
      {
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        completedAt: Date,
      },
    ],
    isArchived: { type: Boolean, default: false },
    isOverdue: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: comment count
taskSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'task',
  count: true,
});

// Auto-mark overdue
taskSchema.pre('save', function (next) {
  if (this.deadline && this.status !== 'done' && this.status !== 'cancelled') {
    this.isOverdue = new Date() > this.deadline;
  }
  if (this.status === 'done' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

taskSchema.index({ project: 1 });
taskSchema.index({ workspace: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ deadline: 1 });

module.exports = mongoose.model('Task', taskSchema);
