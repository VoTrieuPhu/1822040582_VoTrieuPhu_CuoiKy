import { useState, useEffect } from 'react';
import api from '../api';
import {
  BookOpen, CheckCircle2, FileText, Upload, Award,
  Search, ArrowLeft, Video, File, ExternalLink, TrendingUp, Clock
} from 'lucide-react';

const GRADIENTS = [
  'from-indigo-600 to-blue-500',
  'from-emerald-600 to-teal-500',
  'from-violet-600 to-purple-500',
  'from-amber-500 to-orange-500',
];

export default function StudentDashboard({ activeMenu, setActiveMenu, showToast }) {
  const [allCourses, setAllCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseTab, setCourseTab] = useState('materials');
  const [assignments, setAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submissionText, setSubmissionText] = useState({});
  const [submissionFile, setSubmissionFile] = useState({});

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchData = async () => {
    const [coursesRes, enrollRes] = await Promise.all([
      api.get('/courses'),
      api.get('/courses/my-enrollments'),
    ]);
    setAllCourses(coursesRes.data);
    setEnrollments(enrollRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      showToast('Ghi danh khóa học thành công!');
      fetchData();
      setActiveMenu('dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi ghi danh', 'error');
    }
  };

  const openCourseDetail = async (course) => {
    setSelectedCourse(course);
    setCourseTab('materials');
    const res = await api.get(`/assignments/course/${course._id}`);
    setAssignments(res.data);
  };

  const handleUpdateProgress = async (courseId, progress) => {
    await api.put(`/courses/${courseId}/progress`, { progress: Number(progress) });
    showToast(`Đã cập nhật tiến độ: ${progress}%`);
    fetchData();
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const formData = new FormData();
    formData.append('content', submissionText[assignmentId] || '');
    if (submissionFile[assignmentId]) {
      formData.append('file', submissionFile[assignmentId]);
    }
    try {
      await api.post(`/assignments/${assignmentId}/submit`, formData);
      showToast('Nộp bài tập thành công!');
      openCourseDetail(selectedCourse);
    } catch (err) {
      showToast('Lỗi khi nộp bài!', 'error');
    }
  };

  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;

  const enrolledIds = enrollments.map((e) => e.course?._id);
  const filteredCourses = allCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Giao diện bên trong một lớp học (Chia Tab chuẩn Google Classroom)
  if (selectedCourse) {
    const currentEnrollment = enrollments.find((e) => e.course?._id === selectedCourse._id);

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCourse(null)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách lớp học
        </button>

        {/* Banner Lớp học */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 rounded-2xl p-8 text-white shadow-md">
          <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full">
            Giảng viên: {selectedCourse.teacher?.name}
          </span>
          <h1 className="text-3xl font-bold mt-3">{selectedCourse.title}</h1>
          <p className="text-indigo-100 mt-2 max-w-2xl text-sm">{selectedCourse.description}</p>

          {currentEnrollment && (
            <div className="mt-6 max-w-md bg-white/10 p-3.5 rounded-xl backdrop-blur-sm">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span>Tiến độ hoàn thành khóa học</span>
                <span>{currentEnrollment.progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentEnrollment.progress}
                onChange={(e) => handleUpdateProgress(selectedCourse._id, e.target.value)}
                className="w-full accent-white cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Thanh chuyển Tab */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setCourseTab('materials')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              courseTab === 'materials'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> Tài liệu & Bài giảng ({selectedCourse.materials?.length || 0})
          </button>
          <button
            onClick={() => setCourseTab('assignments')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              courseTab === 'assignments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" /> Bài tập trên lớp ({assignments.length})
          </button>
        </div>

        {/* Tab 1: Tài liệu */}
        {courseTab === 'materials' && (
          <div className="grid md:grid-cols-2 gap-4">
            {selectedCourse.materials?.length === 0 ? (
              <div className="col-span-2 bg-white p-10 rounded-2xl border text-center text-slate-500 text-sm">
                Giảng viên chưa đăng tải tài liệu nào cho lớp học này.
              </div>
            ) : (
              selectedCourse.materials?.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-300 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-3 rounded-xl ${
                        m.type === 'pdf'
                          ? 'bg-red-50 text-red-600'
                          : m.type === 'video'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {m.type === 'video' ? <Video className="w-5 h-5" /> : <File className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {m.type}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">{m.title}</h4>
                    </div>
                  </div>
                  <a
                    href={m.url.startsWith('/uploads') ? `http://localhost:5000${m.url}` : m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    Mở xem <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Bài tập */}
        {courseTab === 'assignments' && (
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border text-center text-slate-500 text-sm">
                Chưa có bài tập nào được giao trong khóa học này.
              </div>
            ) : (
              assignments.map((ass) => {
                const mySub = ass.submissions?.find(
                  (s) => s.student?._id === userInfo._id || s.student === userInfo._id
                );
                return (
                  <div key={ass._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-lg text-slate-800">{ass.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{ass.description}</p>
                      </div>
                      {mySub ? (
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                            mySub.grade !== null
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {mySub.grade !== null ? (
                            <>
                              <Award className="w-4 h-4" /> Điểm số: {mySub.grade} / 10
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4" /> Đã nộp • Chờ giảng viên chấm
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
                          Chưa nộp bài
                        </span>
                      )}
                    </div>

                    {mySub?.feedback && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs">
                        <strong>Nhận xét của giảng viên:</strong> {mySub.feedback}
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Nhập nội dung bài làm hoặc dán liên kết bài nộp..."
                        className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={submissionText[ass._id] || ''}
                        onChange={(e) => setSubmissionText({ ...submissionText, [ass._id]: e.target.value })}
                      />
                      <input
                        type="file"
                        className="text-xs file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold hover:file:bg-slate-200 cursor-pointer"
                        onChange={(e) => setSubmissionFile({ ...submissionFile, [ass._id]: e.target.files[0] })}
                      />
                      <button
                        onClick={() => handleSubmitAssignment(ass._id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shrink-0"
                      >
                        {mySub ? 'Nộp lại bài' : 'Nộp bài tập'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Khóa học đang tham gia</p>
            <p className="text-2xl font-bold text-slate-800">{enrollments.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tiến độ học tập trung bình</p>
            <p className="text-2xl font-bold text-slate-800">{avgProgress}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng khóa học trên hệ thống</p>
            <p className="text-2xl font-bold text-slate-800">{allCourses.length}</p>
          </div>
        </div>
      </div>

      {/* View 1: Lớp học của tôi */}
      {activeMenu === 'dashboard' && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Khóa học đã ghi danh ({enrollments.length})</h3>
            <button
              onClick={() => setActiveMenu('explore')}
              className="text-sm text-indigo-600 font-semibold hover:underline"
            >
              + Tìm thêm khóa học mới
            </button>
          </div>

          {enrollments.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
              <p className="text-slate-600 font-medium">Bạn chưa ghi danh vào lớp học nào.</p>
              <button
                onClick={() => setActiveMenu('explore')}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700"
              >
                Khám phá danh sách lớp học
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((en, i) => (
                <div
                  key={en._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className={`h-24 bg-gradient-to-r ${GRADIENTS[i % GRADIENTS.length]} p-5 text-white`}>
                      <p className="text-xs font-medium opacity-90">GV: {en.course?.teacher?.name}</p>
                      <h4 className="font-bold text-lg truncate mt-1">{en.course?.title}</h4>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-slate-600 line-clamp-2">{en.course?.description}</p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>Tiến độ</span>
                        <span className="text-indigo-600">{en.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${en.progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => openCourseDetail(en.course)}
                      className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold transition"
                    >
                      Vào lớp học
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* View 2: Khám phá khóa học */}
      {activeMenu === 'explore' && (
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800">Danh sách lớp học đang mở</h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm tên môn học, giảng viên..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c, i) => {
              const isEnrolled = enrolledIds.includes(c._id);
              return (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className={`h-24 bg-gradient-to-r ${GRADIENTS[(i + 1) % GRADIENTS.length]} p-5 text-white`}>
                      <p className="text-xs font-medium opacity-90">Giảng viên: {c.teacher?.name}</p>
                      <h4 className="font-bold text-lg truncate mt-1">{c.title}</h4>
                    </div>
                    <div className="p-5">
                      <p className="text-sm text-slate-600">{c.description}</p>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <button
                      disabled={isEnrolled}
                      onClick={() => handleEnroll(c._id)}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
                        isEnrolled
                          ? 'bg-emerald-50 text-emerald-700 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isEnrolled ? '✓ Đã ghi danh lớp này' : '+ Ghi danh tham gia'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}