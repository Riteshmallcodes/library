import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, safeJson } from "../utils/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/admin/admin_login.php", {
        method: "POST",
        body: { email, password }
      });
      const data = await safeJson(res);

      if (data?.success) {
        localStorage.setItem("admin", JSON.stringify(data.admin || { email }));
        navigate("/admin", { replace: true });
        return;
      }

      setError(data?.error || "Login failed");
    } catch (err) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
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

        <button type="submit" className="admin-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="admin-error">{error}</p>}
      </form>
    </div>
  );
}
