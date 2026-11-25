import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginRegister from './pages/LoginRegister';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import {
  BookOpen, LogOut, GraduationCap, LayoutDashboard,
  Compass, Users, ShieldCheck, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function App() {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  if (!user) {
    return <LoginRegister />;
  }

  const menusByRole = {
    student: [
      { id: 'dashboard', label: 'Lớp học của tôi', icon: LayoutDashboard },
      { id: 'explore', label: 'Khám phá khóa học', icon: Compass },
    ],
    teacher: [
      { id: 'dashboard', label: 'Quản lý giảng dạy', icon: GraduationCap },
    ],
    admin: [
      { id: 'dashboard', label: 'Tổng quan & Người dùng', icon: Users },
      { id: 'courses', label: 'Danh mục khóa học', icon: BookOpen },
    ],
  };

  const currentMenus = menusByRole[user.role] || [];
  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Toast Notification góc phải */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar cố định bên trái */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between fixed h-full z-20">
        <div>
          {/* Logo */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 leading-tight">Online Classroom</h1>
              <p className="text-[11px] text-slate-400 font-medium">MERN Learning Platform</p>
            </div>
          </div>

          {/* Menu điều hướng */}
          <div className="p-4 space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Menu chính
            </p>
            {currentMenus.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thông tin User & Đăng xuất ở đáy Sidebar */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {initials || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                <ShieldCheck className="w-3 h-3" /> {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 py-2 rounded-xl font-medium transition"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Khu vực nội dung chính bên phải */}
      <div className="flex-1 ml-64">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-bold text-slate-800 text-lg">
            {user.role === 'student' && 'Không gian học tập Sinh viên'}
            {user.role === 'teacher' && 'Không gian quản lý Giảng viên'}
            {user.role === 'admin' && 'Hệ thống Quản trị viên'}
          </h2>
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full font-medium">
            Học kỳ 1 • Năm học 2026
          </span>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          {user.role === 'student' && (
            <StudentDashboard activeMenu={activeMenu} setActiveMenu={setActiveMenu} showToast={showToast} />
          )}
          {user.role === 'teacher' && <TeacherDashboard showToast={showToast} />}
          {user.role === 'admin' && <AdminDashboard activeMenu={activeMenu} showToast={showToast} />}
        </main>
      </div>
    </div>
  );
}