const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: { type: String, maxlength: 500, default: '' },
    slug: { type: String, unique: true, lowercase: true },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['owner', 'admin', 'manager', 'member'],
          default: 'member',
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    isPersonal: { type: Boolean, default: false },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    settings: {
      allowMemberInvite: { type: Boolean, default: false },
      defaultTaskStatus: { type: String, default: 'todo' },
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name
workspaceSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '') +
      '-' +
      Date.now();
  }
  next();
});

workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Workspace', workspaceSchema);
