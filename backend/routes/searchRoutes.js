const express = require('express');
const { searchPhone } = require('../controllers/searchController');
const auth = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimit');
const router = express.Router();

router.post('/', auth, searchLimiter, searchPhone);

module.exports = router;
