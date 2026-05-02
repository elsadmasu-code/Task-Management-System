const express = require('express');
const router = express.Router();
const { getProjectActivityLogs, getWorkspaceActivityLogs, getUserActivityLogs } = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/user', getUserActivityLogs);
router.get('/project/:projectId', getProjectActivityLogs);
router.get('/workspace/:workspaceId', getWorkspaceActivityLogs);

module.exports = router;
