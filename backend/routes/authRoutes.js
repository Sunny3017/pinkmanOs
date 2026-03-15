const express = require('express');
const { login, logout, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getMe);

module.exports = router;
