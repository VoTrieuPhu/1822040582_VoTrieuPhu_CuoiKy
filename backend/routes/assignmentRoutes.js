const express = require('express');
const router = express.Router();
const {
  getAssignmentsByCourse, createAssignment, submitAssignment, gradeSubmission
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.post('/', protect, authorize('teacher'), createAssignment);
router.post('/:id/submit', protect, authorize('student'), upload.single('file'), submitAssignment);
router.put('/:id/grade/:submissionId', protect, authorize('teacher'), gradeSubmission);

module.exports = router;