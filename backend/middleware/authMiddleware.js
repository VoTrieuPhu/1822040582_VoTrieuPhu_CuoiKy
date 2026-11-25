const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Xác thực người dùng đã đăng nhập chưa
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
      }
      if (req.user.isLocked) {
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị Admin khóa!' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
  } else {
    return res.status(401).json({ message: 'Không tìm thấy Token xác thực!' });
  }
};

// Kiểm tra vai trò (Admin, Teacher, Student)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Vai trò '${req.user.role}' không có quyền thực hiện chức năng này!` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };