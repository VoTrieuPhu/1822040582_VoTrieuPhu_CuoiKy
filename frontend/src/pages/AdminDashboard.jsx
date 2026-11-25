import { useState, useEffect } from 'react';
import api from '../api';
import { Shield, Lock, Unlock, Trash2, BookOpen, Users } from 'lucide-react';

export default function AdminDashboard({ activeMenu, showToast }) {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  const fetchData = async () => {
    const [uRes, cRes] = await Promise.all([
      api.get('/admin/users'),
      api.get('/courses'),
    ]);
    setUsers(uRes.data);
    setCourses(cRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleLock = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle-lock`);
      showToast(data.message);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi thao tác!', 'error');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Admin xác nhận xóa khóa học này khỏi hệ thống?')) return;
    await api.delete(`/courses/${id}`);
    showToast('Đã xóa khóa học khỏi hệ thống!');
    fetchData();
  };

  return (
    <div className="space-y-8">
      {/* Thẻ KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng tài khoản trên hệ thống</p>
            <p className="text-3xl font-bold text-slate-800">{users.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng khóa học đang hoạt động</p>
            <p className="text-3xl font-bold text-slate-800">{courses.length}</p>
          </div>
        </div>
      </div>

      {/* Tab Quản lý người dùng */}
      {activeMenu === 'dashboard' && (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Shield className="text-indigo-600 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Quản lý Tài khoản Người dùng</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase">
                  <th className="p-4">Họ tên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-800">{u.name}</td>
                    <td className="p-4 text-slate-500">{u.email}</td>
                    <td className="p-4">
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.isLocked ? (
                        <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">Đã khóa</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">Hoạt động</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleLock(u._id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition ${
                            u.isLocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          {u.isLocked ? <><Unlock className="w-3.5 h-3.5" /> Mở khóa</> : <><Lock className="w-3.5 h-3.5" /> Khóa tài khoản</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab Quản lý danh mục khóa học */}
      {activeMenu === 'courses' && (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Danh mục Khóa học Toàn Hệ Thống</h2>
          <div className="space-y-3">
            {courses.map((c) => (
              <div key={c._id} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50">
                <div>
                  <p className="font-bold text-slate-800">{c.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Giảng viên phụ trách: {c.teacher?.name}</p>
                </div>
                <button
                  onClick={() => handleDeleteCourse(c._id)}
                  className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition"
                >
                  <Trash2 className="w-4 h-4" /> Xóa khóa học
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}