import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("admin");
    navigate("/admin-login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="admin-brand">
          <span className="admin-kicker">Admin</span>
          <h2>Library Panel</h2>
        </div>

        <nav className="admin-nav" onClick={closeMenu}>
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/students">Students</NavLink>
          <NavLink to="/admin/attendance">Attendance</NavLink>
          <NavLink to="/admin/reports">Reports</NavLink>
          <NavLink to="/admin/scan">Scan QR</NavLink>
        </nav>

        <button className="admin-logout" onClick={logout}>
          Logout
        </button>
      </aside>

      {menuOpen && (
        <button
          className="admin-overlay"
          onClick={closeMenu}
          aria-label="Close menu"
        />
      )}

      <main className="admin-main">
        <div className="admin-mobile-bar">
          <button
            className="admin-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            Menu
          </button>
          <span className="admin-mobile-title">Admin Panel</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
