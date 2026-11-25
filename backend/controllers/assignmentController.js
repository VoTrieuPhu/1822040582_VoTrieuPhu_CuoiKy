const Assignment = require('../models/Assignment');

// Lấy danh sách bài tập của 1 khóa học
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('submissions.student', 'name email');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [Teacher] Tạo bài tập mới
exports.createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate } = req.body;
    const assignment = await Assignment.create({
      course: courseId,
      title,
      description,
      dueDate
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [Student] Nộp bài tập (text hoặc upload file)
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Không tìm thấy bài tập!' });

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const existingIndex = assignment.submissions.findIndex(
      (s) => s.student.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      assignment.submissions[existingIndex].content = req.body.content || assignment.submissions[existingIndex].content;
      if (fileUrl) assignment.submissions[existingIndex].fileUrl = fileUrl;
      assignment.submissions[existingIndex].submittedAt = Date.now();
    } else {
      assignment.submissions.push({
        student: req.user._id,
        content: req.body.content,
        fileUrl
      });
    }

    await assignment.save();
    res.json({ message: 'Nộp bài thành công!', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [Teacher] Chấm điểm bài nộp
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Không tìm thấy bài tập!' });

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Không tìm thấy bài nộp!' });

    submission.grade = grade;
    submission.feedback = feedback || '';
    await assignment.save();
    res.json({ message: 'Chấm điểm thành công!', assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};