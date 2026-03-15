const express = require('express');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserUsage,
  getLogs
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

router.use(auth, admin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/reset', resetUserUsage);
router.get('/logs', getLogs);

module.exports = router;
