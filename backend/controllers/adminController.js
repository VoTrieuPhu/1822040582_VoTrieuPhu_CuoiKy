const User = require('../models/User');
const Course = require('../models/Course');

// Lấy danh sách toàn bộ người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Khóa / Mở khóa tài khoản người dùng
exports.toggleLockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Không thể khóa tài khoản Admin!' });

    user.isLocked = !user.isLocked;
    await user.save();
    res.json({ message: user.isLocked ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Quản lý danh mục khóa học toàn hệ thống
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    res.json({ totalUsers, totalCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};