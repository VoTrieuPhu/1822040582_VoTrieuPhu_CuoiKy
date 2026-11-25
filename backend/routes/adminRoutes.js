const express = require('express');
const router = express.Router();
const { getAllUsers, toggleLockUser, getSystemStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/toggle-lock', protect, authorize('admin'), toggleLockUser);
router.get('/stats', protect, authorize('admin'), getSystemStats);

module.exports = router;