const express = require('express');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);                       // Login API -> JWT
router.get('/me', authenticate, ctrl.me);                // verify token, return current user
router.put('/profile', authenticate, ctrl.updateProfile);
router.put('/password', authenticate, ctrl.changePassword);

module.exports = router;
