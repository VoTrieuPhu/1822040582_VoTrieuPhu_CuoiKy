import { useState, useEffect } from 'react';
import api from '../api';
import {
  Plus, Trash2, Users, FilePlus, CheckSquare,
  ArrowLeft, BookOpen, X, Award
} from 'lucide-react';

export default function TeacherDashboard({ showToast }) {
  const [courses, setCourses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('materials');
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [material, setMaterial] = useState({ title: '', type: 'reading', url: '', file: null });
  const [newAss, setNewAss] = useState({ title: '', description: '' });
  const [grades, setGrades] = useState({});

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchCourses = async () => {
    const res = await api.get('/courses');
    setCourses(res.data.filter((c) => c.teacher?._id === userInfo._id));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    await api.post('/courses', newCourse);
    setNewCourse({ title: '', description: '' });
    setShowCreateModal(false);
    showToast('Tạo khóa học mới thành công!');
    fetchCourses();
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Xác nhận xóa khóa học này?')) return;
    await api.delete(`/courses/${id}`);
    showToast('Đã xóa khóa học!');
    if (selectedCourse?._id === id) setSelectedCourse(null);
    fetchCourses();
  };

  const selectCourse = async (course) => {
    setSelectedCourse(course);
    const [stuRes, assRes, detailRes] = await Promise.all([
      api.get(`/courses/${course._id}/students`),
      api.get(`/assignments/course/${course._id}`),
      api.get(`/courses/${course._id}`),
    ]);
    setStudents(stuRes.data);
    setAssignments(assRes.data);
    setSelectedCourse(detailRes.data);
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', material.title);
    formData.append('type', material.type);
    if (material.file) formData.append('file', material.file);
    else formData.append('url', material.url);

    await api.post(`/courses/${selectedCourse._id}/materials`, formData);
    showToast('Đăng tải tài liệu thành công!');
    setMaterial({ title: '', type: 'reading', url: '', file: null });
    selectCourse(selectedCourse);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    await api.post('/assignments', { ...newAss, courseId: selectedCourse._id });
    setNewAss({ title: '', description: '' });
    showToast('Đã giao bài tập mới cho lớp!');
    selectCourse(selectedCourse);
  };

  const handleGrade = async (assId, subId) => {
    const g = grades[subId];
    if (!g || g.score === undefined) return showToast('Vui lòng nhập điểm số!', 'error');
    await api.put(`/assignments/${assId}/grade/${subId}`, {
      grade: Number(g.score),
      feedback: g.feedback || '',
    });
    showToast('Đã lưu điểm và nhận xét!');
    selectCourse(selectedCourse);
  };

  // Giao diện chi tiết quản lý 1 lớp học (Chia 3 Tab)
  if (selectedCourse) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCourse(null)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách lớp giảng dạy
        </button>

        {/* Banner Lớp học */}
        <div className="bg-gradient-to-r from-slate-800 to-indigo-900 rounded-2xl p-8 text-white shadow-md">
          <span className="bg-white/15 text-xs font-semibold px-3 py-1 rounded-full">
            Quản lý lớp học • {students.length} sinh viên
          </span>
          <h1 className="text-3xl font-bold mt-3">{selectedCourse.title}</h1>
          <p className="text-slate-300 mt-1 text-sm">{selectedCourse.description}</p>
        </div>

        {/* 3 Tab điều hướng */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'materials'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FilePlus className="w-4 h-4" /> Tài liệu học tập ({selectedCourse.materials?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Bài tập & Chấm điểm ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'students'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Sinh viên ghi danh ({students.length})
          </button>
        </div>

        {/* Tab 1: Tài liệu */}
        {activeTab === 'materials' && (
          <div className="grid md:grid-cols-3 gap-6">
            <form onSubmit={handleAddMaterial} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-slate-800">Đăng tải tài liệu mới</h3>
              <input
                type="text"
                required
                placeholder="Tiêu đề tài liệu"
                className="w-full border rounded-xl px-3.5 py-2 text-sm"
                value={material.title}
                onChange={(e) => setMaterial({ ...material, title: e.target.value })}
              />
              <select
                className="w-full border rounded-xl px-3.5 py-2 text-sm bg-white"
                value={material.type}
                onChange={(e) => setMaterial({ ...material, type: e.target.value })}
              >
                <option value="reading">Bài đọc / Đường dẫn</option>
                <option value="pdf">Tài liệu PDF</option>
                <option value="video">Video bài giảng</option>
              </select>
              <input
                type="text"
                placeholder="Dán Link Video/Tài liệu..."
                className="w-full border rounded-xl px-3.5 py-2 text-sm"
                value={material.url}
                onChange={(e) => setMaterial({ ...material, url: e.target.value })}
              />
              <div className="text-xs text-slate-500">Hoặc tải file từ máy tính:</div>
              <input
                type="file"
                className="text-xs"
                onChange={(e) => setMaterial({ ...material, file: e.target.files[0] })}
              />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold">
                + Thêm tài liệu
              </button>
            </form>

            <div className="md:col-span-2 space-y-3">
              <h3 className="font-bold text-slate-800">Danh sách tài liệu đã đăng</h3>
              {selectedCourse.materials?.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border text-center text-sm text-slate-500">
                  Chưa có tài liệu nào trong khóa học này.
                </div>
              ) : (
                selectedCourse.materials?.map((m, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                        {m.type}
                      </span>
                      <p className="font-semibold text-slate-800 text-sm mt-1">{m.title}</p>
                    </div>
                    <a
                      href={m.url.startsWith('/uploads') ? `http://localhost:5000${m.url}` : m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 text-xs font-semibold hover:underline"
                    >
                      Xem tài liệu →
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Bài tập & Chấm điểm */}
        {activeTab === 'assignments' && (
          <div className="grid md:grid-cols-3 gap-6">
            <form onSubmit={handleCreateAssignment} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-slate-800">Giao bài tập mới</h3>
              <input
                type="text"
                required
                placeholder="Tên bài tập (VD: Lab 01 - REST API)"
                className="w-full border rounded-xl px-3.5 py-2 text-sm"
                value={newAss.title}
                onChange={(e) => setNewAss({ ...newAss, title: e.target.value })}
              />
              <textarea
                placeholder="Mô tả yêu cầu bài tập..."
                className="w-full border rounded-xl px-3.5 py-2 text-sm"
                rows="4"
                value={newAss.description}
                onChange={(e) => setNewAss({ ...newAss, description: e.target.value })}
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold">
                + Giao bài tập
              </button>
            </form>

            <div className="md:col-span-2 space-y-4">
              {assignments.map((ass) => (
                <div key={ass._id} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h4 className="font-bold text-slate-800">{ass.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{ass.description}</p>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
                      {ass.submissions?.length || 0} bài nộp
                    </span>
                  </div>

                  {ass.submissions?.length === 0 ? (
                    <p className="text-xs text-slate-400">Chưa có sinh viên nào nộp bài.</p>
                  ) : (
                    ass.submissions?.map((sub) => (
                      <div key={sub._id} className="bg-slate-50 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm text-slate-800">
                              {sub.student?.name} <span className="font-normal text-slate-500">({sub.student?.email})</span>
                            </p>
                            <p className="text-sm text-slate-600 mt-1">Bài làm: {sub.content || 'Đính kèm tệp'}</p>
                            {sub.fileUrl && (
                              <a
                                href={`http://localhost:5000${sub.fileUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mt-1 text-indigo-600 underline text-xs font-medium"
                              >
                                Tải xuống tệp bài nộp
                              </a>
                            )}
                          </div>
                          {sub.grade !== null && (
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" /> {sub.grade}/10
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            placeholder={sub.grade !== null ? `${sub.grade}` : 'Điểm (0-10)'}
                            className="w-28 border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                            onChange={(e) =>
                              setGrades({
                                ...grades,
                                [sub._id]: { ...grades[sub._id], score: e.target.value },
                              })
                            }
                          />
                          <input
                            type="text"
                            placeholder={sub.feedback || 'Nhập nhận xét cho sinh viên...'}
                            className="flex-1 border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                            onChange={(e) =>
                              setGrades({
                                ...grades,
                                [sub._id]: { ...grades[sub._id], feedback: e.target.value },
                              })
                            }
                          />
                          <button
                            onClick={() => handleGrade(ass._id, sub._id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold"
                          >
                            Lưu điểm
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Danh sách sinh viên */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b text-slate-600">
                <tr>
                  <th className="p-4">Sinh viên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Tiến độ học tập</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-b last:border-0">
                    <td className="p-4 font-semibold text-slate-800">{s.student?.name}</td>
                    <td className="p-4 text-slate-500">{s.student?.email}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 max-w-xs">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${s.progress}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{s.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Các lớp học đang giảng dạy ({courses.length})</h3>
          <p className="text-sm text-slate-500">Quản lý nội dung bài giảng, bài tập và chấm điểm sinh viên</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Tạo khóa học mới
        </button>
      </div>

      {/* Modal Tạo khóa học */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateCourse} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Tạo Khóa Học Mới</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tên khóa học</label>
              <input
                type="text"
                required
                placeholder="VD: Lập trình Web MERN Stack"
                className="w-full border rounded-xl px-3.5 py-2.5 text-sm"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mô tả khóa học</label>
              <textarea
                required
                rows="3"
                placeholder="Nhập giới thiệu nội dung môn học..."
                className="w-full border rounded-xl px-3.5 py-2.5 text-sm"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold"
              >
                Tạo lớp học
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid khóa học */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <div key={c._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="h-24 bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white flex justify-between items-start">
                <div className="overflow-hidden">
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-medium">
                    {c.materials?.length || 0} tài liệu
                  </span>
                  <h4 className="font-bold text-lg truncate mt-1.5">{c.title}</h4>
                </div>
                <button
                  onClick={() => handleDeleteCourse(c._id)}
                  className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
                  title="Xóa khóa học"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-600 line-clamp-2">{c.description}</p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => selectCourse(c)}
                className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Quản lý lớp học
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}