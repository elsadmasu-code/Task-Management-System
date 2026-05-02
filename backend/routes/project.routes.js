const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProject, updateProject, addProjectMember, removeProjectMember, deleteProject } = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');
const { createProjectValidation, updateProjectValidation } = require('../validations/project.validation');

router.use(protect);

router.route('/').get(getProjects).post(createProjectValidation, createProject);
router.route('/:id').get(getProject).put(updateProjectValidation, updateProject).delete(deleteProject);
router.route('/:id/members').post(addProjectMember);
router.route('/:id/members/:userId').delete(removeProjectMember);

module.exports = router;
