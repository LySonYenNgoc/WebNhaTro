import React, { useContext } from 'react'
import ReactDOM from 'react-dom/client'
// eslint-disable-next-line no-unused-vars
import App from './App.jsx'
import './styles/global.css';
import Homepage from './pages/home.jsx'
import Nguoidungpage from './pages/Admin/Nguoidung.jsx'
import BaidangPage from './pages/Admin/Baidang.jsx';
import ThemBaidangPage from './pages/Admin/ThemBaidang.jsx';
import BaiVietPheDuyetPage from './pages/Admin/BaiVietPheDuyet.jsx';
import AdminLayout from './components/layout/AdminLayout';
import ChutroLayout from './components/layout/ChutroLayout';
import QuanLyPhongPage from './pages/Chutro/QuanLyPhong.jsx';
import DanhSachKhachThuePage from './pages/Chutro/DanhSachKhachThue.jsx';
import TatCaBaiVietPage from './pages/Chutro/TatCaBaiViet.jsx';
import ChiSoDienPage from './pages/Chutro/ChiSoDien.jsx';
import ChiSoNuocPage from './pages/Chutro/ChiSoNuoc.jsx';
import TinhTienPage from './pages/Chutro/TinhTien.jsx';
import DoanhThuPage from './pages/Chutro/DoanhThu.jsx';
import PropertyDetailPage from './pages/PhongtroDetail.jsx';
import DanhSachTroPage from './pages/DanhSachTro.jsx';
import GioiThieuPage from './pages/GioiThieu.jsx';
import DieuKhoanSuDungPage from './pages/DieuKhoanSuDung.jsx';
import ChinhSachBaoMatPage from './pages/ChinhSachBaoMat.jsx';
import DangKyChuTroPage from './pages/DangKyChuTro.jsx';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import LoginPage from './pages/Login.jsx';
import RegisterPage from './pages/register.jsx';
import { AuthWrapper, AuthContext } from './context/authcontext.jsx';

const Protected = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) {
    return <Navigate to="/Dangnhap" replace />;
  }
  return children;
};

// Protected route với role check
const ProtectedRole = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/Dangnhap" replace />;
  }
  
  // Lấy role và normalize (lowercase, trim)
  // Xử lý cả Role (PascalCase) và role (camelCase) từ backend/database
  const rawRole = user?.Role || user?.role || '';
  const userRole = String(rawRole).toLowerCase().trim();
  
  console.log('� ProtectedRole check - userRole:', userRole, 'allowedRoles:', allowedRoles, 'user:', user);
  
  // Normalize allowedRoles để so sánh
  const normalizedAllowedRoles = allowedRoles.map(role => String(role).toLowerCase().trim());
  
  // Nếu không có role được chỉ định hoặc user có role hợp lệ
  if (allowedRoles.length === 0 || (userRole && normalizedAllowedRoles.includes(userRole))) {
    return children;
  }
  
  // Redirect dựa trên role của user (case-insensitive)
  // Admin luôn được redirect đến /admin
  if (userRole === 'admin') {
    console.log(' ProtectedRole: Redirecting admin to /admin');
    return <Navigate to="/admin" replace />;
  } else if (userRole === 'host' || userRole === 'chutro') {
    console.log(' ProtectedRole: Redirecting host/chutro to /Chutro');
    return <Navigate to="/Chutro" replace />;
  } else {
    console.log(' ProtectedRole: Redirecting user to homepage');
    return <Navigate to="/" replace />;
  }
};

// Component để chọn layout dựa trên role
const RoleBasedLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const userRole = ((user?.Role || user?.role || '').toString().toLowerCase().trim());
  
  if (userRole === 'admin') {
    return <AdminLayout>{children}</AdminLayout>;
  } else if (userRole === 'host' || userRole === 'chutro') {
    return <ChutroLayout>{children}</ChutroLayout>;
  }
  return children;
};
const router = createBrowserRouter([
  // alias for legacy /Login and fallback routes
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: "phongtro/:id",
        element: <PropertyDetailPage />,
      },
      {
        path: "danh-sach/:category?",
        element: <DanhSachTroPage />,
      },
      {
        path: "gioi-thieu",
        element: <GioiThieuPage />,
      },
      {
        path: "dieu-khoan-su-dung",
        element: <DieuKhoanSuDungPage />,
      },
      {
        path: "chinh-sach-bao-mat",
        element: <ChinhSachBaoMatPage />,
      },
      {
        path: "dang-ky-chu-tro",
        element: <DangKyChuTroPage />,
      },
      {
        path: "admin",
        element: (
          <ProtectedRole allowedRoles={['admin']}>
            <AdminLayout>
              <BaidangPage />
            </AdminLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Nguoidung",
        element: (
          <ProtectedRole allowedRoles={['admin']}>
            <AdminLayout>
            <Nguoidungpage />
            </AdminLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Tất cả bài đăng",
        element: (
          <ProtectedRole allowedRoles={['admin']}>
            <AdminLayout>
            <BaidangPage />
            </AdminLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "admin/tatcabaidang",
        element: (
          <ProtectedRole allowedRoles={['admin']}>
            <AdminLayout>
            <BaidangPage />
            </AdminLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Bài viết cho phê duyệt",
        element: (
          <ProtectedRole allowedRoles={['admin']}>
            <AdminLayout>
              <BaiVietPheDuyetPage />
            </AdminLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Thêm bài đăng",
        element: (
          <ProtectedRole allowedRoles={['admin', 'host', 'chutro']}>
            <RoleBasedLayout>
              <ThemBaidangPage />
            </RoleBasedLayout>
          </ProtectedRole>
        ),
      },
      // Routes cho Chủ trọ
      {
        path: "Chutro",
        element: (
          <ProtectedRole allowedRoles={['host', 'chutro']}>
            <ChutroLayout>
              <Navigate to="/Chutro/Danh sách khách thuê" replace />
            </ChutroLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Chutro/Danh sách khách thuê",
        element: (
          <ProtectedRole allowedRoles={['host']}>
            <ChutroLayout>
              <DanhSachKhachThuePage />
            </ChutroLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Chutro/Danh sách phòng trọ",
        element: (
          <ProtectedRole allowedRoles={['host']}>
            <ChutroLayout>
              <QuanLyPhongPage />
            </ChutroLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Chutro/Tất cả bài viết",
        element: (
          <ProtectedRole allowedRoles={['host']}>
            <ChutroLayout>
              <TatCaBaiVietPage />
            </ChutroLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Chutro/Đăng bài viết mới",
        element: (
          <ProtectedRole allowedRoles={['host']}>
            <ChutroLayout>
              <ThemBaidangPage />
            </ChutroLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Chutro/Chỉ số điện",
        element: (
          <ProtectedRole allowedRoles={['host']}>
            <ChutroLayout>
              <ChiSoDienPage />
            </ChutroLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Chutro/Chỉ số nước",
        element: (
          <ProtectedRole allowedRoles={['host']}>
            <ChutroLayout>
              <ChiSoNuocPage />
            </ChutroLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Chutro/Tính tiền",
        element: (
          <ProtectedRole allowedRoles={['host']}>
            <ChutroLayout>
              <TinhTienPage />
            </ChutroLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Chutro/Doanh thu theo tháng",
        element: (
          <ProtectedRole allowedRoles={['host']}>
            <ChutroLayout>
              <DoanhThuPage />
            </ChutroLayout>
          </ProtectedRole>
        ),
      },
      {
        path: "Dangnhap",
        element: <LoginPage />,
      },
      {
        path: "Login",
        element: <Navigate to="/Dangnhap" replace />,
      },
  {
    path: "register",
    element: <RegisterPage />,
      },
      {
        path: "Register",
        element: <Navigate to="/register" replace />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ]
  },
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthWrapper>
    <RouterProvider router={router} />
    </AuthWrapper>
  </React.StrictMode>,
)
