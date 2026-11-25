const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Lấy tất cả khóa học
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('teacher', 'name email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết 1 khóa học
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name email');
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học!' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [Teacher] Tạo khóa học mới
exports.createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.create({
      title,
      description,
      teacher: req.user._id
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [Teacher] Cập nhật khóa học
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học!' });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền sửa khóa học này!' });
    }
    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [Teacher / Admin] Xóa khóa học
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học!' });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xóa!' });
    }
    await course.deleteOne();
    res.json({ message: 'Đã xóa khóa học thành công!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [Teacher] Đăng tải tài liệu vào khóa học
exports.addMaterial = async (req, res) => {
  try {
    const { title, type, url } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học!' });

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : url;
    course.materials.push({ title, type: type || 'reading', url: fileUrl });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [Student] Ghi danh vào khóa học
exports.enrollCourse = async (req, res) => {
  try {
    const exists = await Enrollment.findOne({ student: req.user._id, course: req.params.id });
    if (exists) return res.status(400).json({ message: 'Bạn đã ghi danh khóa học này rồi!' });

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: req.params.id
    });
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [Student] Lấy danh sách khóa học đã ghi danh & tiến độ
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id }).populate({
      path: 'course',
      populate: { path: 'teacher', select: 'name' }
    });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [Student] Cập nhật tiến độ học tập
exports.updateProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.id });
    if (!enrollment) return res.status(404).json({ message: 'Chưa ghi danh khóa học này!' });
    enrollment.progress = req.body.progress;
    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [Teacher] Xem danh sách sinh viên đã ghi danh vào lớp
exports.getCourseStudents = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.id }).populate('student', 'name email');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};