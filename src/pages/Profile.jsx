import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { apiFetch, safeJson } from "../utils/api";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    if (!loadingUser && !user) {
      navigate("/login", { replace: true });
    }
  }, [loadingUser, user, navigate]);

  const student_id = user?.student_id;
  const name = user?.name;

  const [isOnline, setIsOnline] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [attendance, setAttendance] = useState("Checking...");
  const [weeklyHours, setWeeklyHours] = useState("0h 0m");
  const [rank, setRank] = useState("--");

  const loadStatus = async () => {
    if (!student_id) return;
    const res = await apiFetch(`/checkStatus.php?student_id=${student_id}`);
    const data = await safeJson(res);
    setIsOnline(!!data.online);
    setSeconds(Number(data.seconds) || 0);
  };

  const loadAttendance = async () => {
    const res = await apiFetch(`/todayAttendance.php?student_id=${student_id}`);
    const data = await safeJson(res);
    setAttendance(data.present ? "Present today" : "Absent");
  };

  const loadWeeklyHours = async () => {
    const res = await apiFetch(`/weeklyHours.php?student_id=${student_id}`);
    const data = await safeJson(res);
    const total = Number(data.seconds) || 0;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    setWeeklyHours(`${h}h ${m}m`);
  };

  const loadRank = async () => {
    const res = await apiFetch(`/rank.php?student_id=${student_id}`);
    const data = await safeJson(res);
    setRank(data.rank || "--");
  };

  const startStudy = async () => {
    await apiFetch("/startStudy.php", {
      method: "POST",
      body: { student_id }
    });
    loadStatus();
    loadAttendance();
  };

  const stopStudy = async () => {
    await apiFetch("/stopStudy.php", {
      method: "POST",
      body: { student_id }
    });
    setIsOnline(false);
    setSeconds(0);
    loadWeeklyHours();
    loadRank();
  };

  useEffect(() => {
    if (!student_id) return;
    loadStatus();
    loadAttendance();
    loadWeeklyHours();
    loadRank();
  }, [student_id]);

  useEffect(() => {
    if (!isOnline) return;
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOnline]);

  const formatTime = () => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const initials = (name || "Student")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  if (loadingUser) {
    return <p className="profile-loading">Loading...</p>;
  }

  const qrValue = JSON.stringify({ student_id, name });

  return (
    <section className="profile-page">
      <div className="profile-shell">
        <header className="profile-top">
          <div>
            <p className="profile-kicker">Student account</p>
            <h2>Profile</h2>
            <p className="profile-subtitle">
              Manage your session, attendance, and study progress.
            </p>
          </div>
          <button className="profile-logout" onClick={logout}>
            Log out
          </button>
        </header>

        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-identity">
              <div className="profile-avatar">{initials}</div>
              <div>
                <h3>{name || "Student"}</h3>
                <p>ID: {student_id}</p>
              </div>
            </div>

            <div className="profile-status">
              <span
                className={
                  isOnline ? "status-pill online" : "status-pill offline"
                }
              >
                {isOnline ? "Online" : "Offline"}
              </span>

              {isOnline ? (
                <button className="profile-btn stop" onClick={stopStudy}>
                  Stop study
                </button>
              ) : (
                <button className="profile-btn start" onClick={startStudy}>
                  Start study
                </button>
              )}
            </div>
          </div>

          <div className="profile-card highlight">
            <h4>Study time</h4>
            <p className="profile-time">{formatTime()}</p>
            <p className="profile-note">Live session timer while online.</p>
          </div>

          <div className="profile-card">
            <h4>Access pass</h4>
            <div className="profile-qr">
              <QRCodeCanvas value={qrValue} size={200} level="H" />
            </div>
            <p className="profile-note">Show this QR at the help desk.</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <span>Attendance</span>
            <strong>{attendance}</strong>
          </div>
          <div className="stat-card">
            <span>Plan</span>
            <strong>Monthly</strong>
          </div>
          <div className="stat-card">
            <span>Weekly hours</span>
            <strong>{weeklyHours}</strong>
          </div>
          <div className="stat-card">
            <span>Rank</span>
            <strong>{rank}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
