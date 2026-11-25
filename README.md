# 🎓 Hệ Thống Lớp Học Trực Tuyến (Online Classroom - MERN Stack)

* **Sinh viên thực hiện:** Võ Triệu Phú
* **MSSV:** 1822040582
* **Đơn vị:** Khoa Công nghệ Thông tin - Trường Đại học Công nghệ Đồng Nai
* **Học phần:** Phát triển Ứng dụng Web (MERN Stack)

---

## 📖 1. Giới thiệu tổng quan
**Online Classroom** là nền tảng quản lý học tập trực tuyến (LMS) được xây dựng theo kiến trúc **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Hệ thống hỗ trợ xác thực người dùng bằng **JWT (JSON Web Token)**, mã hóa mật khẩu bằng **Bcryptjs** và phân quyền chặt chẽ theo 3 vai trò: **Quản trị viên (Admin)**, **Giảng viên (Teacher)** và **Sinh viên (Student)**.

---

## ✨ 2. Các chức năng chính đã hoàn thiện

### 🔐 Xác thực & Phân quyền (Authentication & Authorization)
* Đăng ký tài khoản mới cho phép chọn vai trò (`Student`, `Teacher`, `Admin`).
* Đăng nhập bảo mật bằng JWT Token, tự động điều hướng đến Dashboard tương ứng.
* Middleware bảo vệ Route, chặn truy cập trái phép giữa các vai trò và tự động từ chối đăng nhập đối với tài khoản bị khóa.

### 👨‍🏫 Vai trò Giảng viên (Teacher)
* Tạo mới, xem danh sách và xóa các khóa học/lớp học do mình phụ trách.
* Đăng tải tài liệu học tập đa dạng (tệp PDF qua Multer, liên kết Video bài giảng, bài đọc).
* Tạo bài tập mới cho lớp học.
* Theo dõi danh sách sinh viên đã ghi danh cùng phần trăm tiến độ học tập.
* Xem bài nộp (văn bản và tệp đính kèm), chấm điểm (thang điểm 10) và ghi nhận xét cho từng sinh viên.

### 👨‍🎓 Vai trò Sinh viên (Student)
* Xem thống kê học tập cá nhân (số khóa học đã tham gia, tiến độ trung bình).
* Tìm kiếm và ghi danh (Enroll) vào các khóa học đang mở trên hệ thống.
* Truy cập không gian lớp học để xem/tải tài liệu bài giảng.
* Cập nhật thanh tiến độ hoàn thành khóa học (`0%` – `100%`).
* Nộp bài tập trực tuyến (nhập nội dung hoặc đính kèm file) và xem điểm số, nhận xét từ giảng viên.

### 🛡️ Vai trò Quản trị viên (Admin)
* Thống kê tổng số tài khoản người dùng và tổng số khóa học trên toàn hệ thống.
* Quản lý danh sách toàn bộ tài khoản người dùng; thực hiện thao tác **Khóa / Mở khóa** tài khoản.
* Kiểm duyệt danh mục khóa học toàn hệ thống và xóa khóa học không hợp lệ.

---

## 🛠️ 3. Công nghệ sử dụng
* **Frontend:** React.js (Vite), Tailwind CSS, React Context API, Axios, Lucide React Icons.
* **Backend:** Node.js, Express.js, JSON Web Token (JWT), Bcryptjs, Multer, CORS, Dotenv.
* **Database:** MongoDB & Mongoose ODM.

---

## 📂 4. Cấu trúc thư mục dự án

```text
1822040582_VoTrieuPhu_CuoiKy/
├── backend/                  # Mã nguồn Backend (Node.js / Express)
│   ├── controllers/          # Xử lý logic nghiệp vụ (Auth, Course, Assignment, Admin)
│   ├── middleware/           # Xác thực JWT & kiểm tra phân quyền Role
│   ├── models/               # Mongoose Schemas (User, Course, Enrollment, Assignment)
│   ├── routes/               # Định tuyến RESTful API
│   ├── uploads/              # Thư mục lưu trữ file tài liệu và bài nộp tải lên
│   ├── .env                  # Biến môi trường cục bộ (không push lên Git)
│   ├── package.json
│   └── server.js             # File khởi chạy Server Express
├── frontend/                 # Mã nguồn Frontend (React / Vite / Tailwind)
│   ├── src/
│   │   ├── context/          # Quản lý trạng thái đăng nhập (AuthContext)
│   │   ├── pages/            # Giao diện LoginRegister, Student, Teacher, Admin Dashboard
│   │   ├── api.js            # Cấu hình Axios & tự động đính kèm Bearer Token
│   │   ├── App.jsx           # Layout Sidebar & điều hướng chính
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── .gitignore                # Loại trừ node_modules, .env và file build
└── README.md                 # Tài liệu hướng dẫn dự án