# Hệ Thống Lớp Học Trực Tuyến (Online Classroom - MERN Stack)

- **Sinh viên thực hiện:** Võ Triệu Phú
- **MSSV:** 1822040582
- **Môn học:** Phát triển ứng dụng Web (MERN Stack)

## Giới thiệu
Ứng dụng quản lý lớp học trực tuyến (LMS) hỗ trợ 3 vai trò người dùng (**Admin**, **Teacher**, **Student**) với các chức năng: đăng ký/đăng nhập bảo mật JWT, tạo và quản lý khóa học, đăng tải tài liệu (PDF/Video/Bài đọc), ghi danh lớp học, cập nhật tiến độ học tập, giao/nộp bài tập và chấm điểm trực tuyến.

## Công nghệ sử dụng
- **Frontend:** React.js (Vite), Tailwind CSS, React Context API, Axios, Lucide Icons
- **Backend:** Node.js, Express.js, JWT, Bcryptjs, Multer
- **Database:** MongoDB & Mongoose

## Hướng dẫn cài đặt và khởi chạy cục bộ

### 1. Cài đặt và chạy Backend
```bash
cd backend
npm install