import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const envEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  const fallbackEmail = isLocalhost ? "admin@library.com" : "";
  const fallbackPassword = isLocalhost ? "admin123" : "";
  const allowedEmail = envEmail || fallbackEmail;
  const allowedPassword = envPassword || fallbackPassword;

  const handleLogin = (e) => {
    e.preventDefault();

    if (!allowedEmail || !allowedPassword) {
      setError("Admin credentials not configured. Set VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD.");
      return;
    }

    if (email === allowedEmail && password === allowedPassword) {
      localStorage.setItem("admin", "true");
      navigate("/admin", { replace: true });
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-box" onSubmit={handleLogin}>
        <div>
          <p className="admin-kicker">Admin access</p>
          <h2>Sign in</h2>
          <p className="admin-login-note">Use your admin email and password.</p>
        </div>

        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            placeholder="admin@library.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            placeholder="????????"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="admin-btn">
          Login
        </button>

        {error && <p className="admin-error">{error}</p>}
      </form>
    </div>
  );
}
