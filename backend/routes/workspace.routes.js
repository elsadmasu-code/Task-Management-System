const express = require('express');
const router = express.Router();
const { createWorkspace, getWorkspaces, getWorkspace, updateWorkspace, addMember, removeMember, deleteWorkspace } = require('../controllers/workspace.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').get(getWorkspaces).post(createWorkspace);
router.route('/:id').get(getWorkspace).put(updateWorkspace).delete(deleteWorkspace);
router.route('/:id/members').post(addMember);
router.route('/:id/members/:userId').delete(removeMember);

module.exports = router;
