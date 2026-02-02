import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          return;
        } catch {
          localStorage.removeItem("user");
        }
      }
      setUser(null);
    };

    loadUser();

    const handleStorage = (event) => {
      if (event.key === "user") {
        loadUser();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [location.key]);

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          Career Point Library
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/help">Help</NavLink>

          {/* ONLY ONE THING: Login OR Username */}
          {user ? (
            <NavLink to="/profile" className="user-name">
              Hi, {user?.name ?? "Profile"}
            </NavLink>
          ) : (
            <NavLink to="/login" className="login-btn">
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
