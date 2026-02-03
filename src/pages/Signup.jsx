import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, safeJson } from "../utils/api";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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

    if (!form.name || !form.email || !form.password) {
      setStatus("All fields are required");
      return;
    }

    setLoading(true);
    setStatus("Creating account...");

    try {
      const res = await apiFetch("/signup.php", {
        method: "POST",
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password
        }
      });

      const data = await safeJson(res);

      if (data.success) {
        setStatus("Account created. Please login.");
        setForm({ name: "", email: "", password: "" });

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setStatus(data.error || `Signup failed (${res.status})`);
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
            <h2>Create your account</h2>
            <p className="auth-subtitle">Register as a student</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Full name</span>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                autoComplete="name"
              />
            </label>

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
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
              />
            </label>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {status && <p className="auth-status">{status}</p>}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-inner">
            <h3>Build your study rhythm</h3>
            <p>
              Create your profile to unlock study tracking, attendance, and
              curated collections tailored for you.
            </p>
            <div className="auth-stats">
              <div>
                <strong>Smart</strong>
                <span>Tracking</span>
              </div>
              <div>
                <strong>Daily</strong>
                <span>Goals</span>
              </div>
              <div>
                <strong>Secure</strong>
                <span>Profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
