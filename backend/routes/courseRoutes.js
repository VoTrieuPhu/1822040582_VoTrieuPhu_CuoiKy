const express = require('express');
const router = express.Router();
const {
  getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse,
  addMaterial, enrollCourse, getMyEnrollments, updateProgress, getCourseStudents
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getAllCourses);
router.get('/my-enrollments', protect, authorize('student'), getMyEnrollments);
router.get('/:id', protect, getCourseById);
router.post('/', protect, authorize('teacher'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);
router.post('/:id/materials', protect, authorize('teacher'), upload.single('file'), addMaterial);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);
router.put('/:id/progress', protect, authorize('student'), updateProgress);
router.get('/:id/students', protect, authorize('teacher', 'admin'), getCourseStudents);

module.exports = router;