const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc   Get all users (admin) or workspace members
// @route  GET /api/users
// @access Private
const getUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;
  const query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).select('-password').skip(skip).limit(Number(limit)).sort({ name: 1 }),
    User.countDocuments(query),
  ]);

  res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
});

// @desc   Get user profile by ID
// @route  GET /api/users/:id
// @access Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const taskStats = await Task.aggregate([
    { $match: { assignedTo: user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({ success: true, user, taskStats });
});

// @desc   Update own profile
// @route  PUT /api/users/profile
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (phone !== undefined) user.phone = phone;

  // Handle avatar upload
  if (req.file) {
    user.avatar = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  await user.save();
  res.json({ success: true, user });
});

// @desc   Delete own account
// @route  DELETE /api/users/me
// @access Private
const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  res.json({ success: true, message: 'Account deactivated' });
});

// @desc   Search users (for invite)
// @route  GET /api/users/search
// @access Private
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, users: [] });

  const users = await User.find({
    isActive: true,
    _id: { $ne: req.user._id },
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ],
  })
    .select('name email avatar role')
    .limit(10);

  res.json({ success: true, users });
});

module.exports = { getUsers, getUserById, updateProfile, deleteAccount, searchUsers };
