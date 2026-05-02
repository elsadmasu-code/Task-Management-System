const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, editMessage, deleteMessage, markAsRead, getUnreadCount } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/unread', getUnreadCount);
router.post('/read', markAsRead);
router.route('/messages').get(getMessages).post(sendMessage);
router.route('/messages/:id').put(editMessage).delete(deleteMessage);

module.exports = router;
