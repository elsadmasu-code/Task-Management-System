const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { registerValidation, loginValidation } = require('../validations/auth.validation');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
