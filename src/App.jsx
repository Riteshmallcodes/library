import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

/* USER */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingContact from "./components/FloatingContact";

import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

/* ADMIN */
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminProtected from "./admin/AdminProtected";
import AdminDashboard from "./admin/AdminDashboard";
import Students from "./admin/Students";
import Attendance from "./admin/Attendance";
import Reports from "./admin/Reports";
import ScanQR from "./admin/ScanQR";

function UserLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <FloatingContact />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* USER WEBSITE */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="help" element={<Help />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ADMIN LOGIN */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* ADMIN PANEL */}
        <Route
          path="/admin"
          element={
            <AdminProtected>
              <AdminLayout />
            </AdminProtected>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="scan" element={<ScanQR />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
