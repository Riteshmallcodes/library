import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, safeJson } from "../utils/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setStatus("Email and password are required");
      return;
    }

    setLoading(true);
    setStatus("Logging in...");

    try {
      const res = await apiFetch("/login.php", {
        method: "POST",
        body: form
      });

      const data = await safeJson(res);

      if (data.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));

        setStatus("Login successful");
        setTimeout(() => {
          navigate("/profile");
        }, 600);
      } else {
        setStatus(data.error || `Login failed (${res.status})`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Network error");
    }

    setLoading(false);
  };

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-badge">Student Portal</span>
            <h2>Welcome back</h2>
            <p className="auth-subtitle">Login to your student account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
              />
            </label>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {status && <p className="auth-status">{status}</p>}

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-inner">
            <h3>Read. Learn. Grow.</h3>
            <p>
              Access your library profile, track your study time, and explore
              new resources designed for students.
            </p>
            <div className="auth-stats">
              <div>
                <strong>24/7</strong>
                <span>Access</span>
              </div>
              <div>
                <strong>10k+</strong>
                <span>Books</span>
              </div>
              <div>
                <strong>500+</strong>
                <span>Courses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

