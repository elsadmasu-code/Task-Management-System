const express = require('express');
const router = express.Router();
const { addComment, getComments, updateComment, deleteComment, reactToComment } = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').get(getComments).post(addComment);
router.route('/:id').put(updateComment).delete(deleteComment);
router.post('/:id/react', reactToComment);

module.exports = router;
