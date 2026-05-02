const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateProfile, deleteAccount, searchUsers } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../middleware/upload.middleware');

router.use(protect);

router.get('/search', searchUsers);
router.get('/profile', (req, res) => res.json({ success: true, user: req.user }));
router.put('/profile', uploadAvatar, updateProfile);
router.delete('/me', deleteAccount);
router.get('/', getUsers);
router.get('/:id', getUserById);

module.exports = router;
