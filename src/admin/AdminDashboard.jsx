import { useEffect, useMemo, useState } from "react";

const todayISO = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    const date = todayISO();

    Promise.all([
      fetch("/api/admin/students.php").then((r) => r.json()),
      fetch(`/api/admin/attendance.php?date=${date}`).then((r) => r.json()),
      fetch("/api/admin/reports.php").then((r) => r.json())
    ])
      .then(([studentsRes, attendanceRes, reportsRes]) => {
        if (!active) return;
        setStudents(Array.isArray(studentsRes) ? studentsRes : []);
        setAttendance(Array.isArray(attendanceRes) ? attendanceRes : []);
        setReports(Array.isArray(reportsRes) ? reportsRes : []);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const date = todayISO();
    const totalStudents = students.length;
    const todayAttendance = attendance.length;
    const onlineStudents = attendance.filter((row) => !row.out_time).length;
    const todayHours = reports
      .filter((row) => (row.date ?? row.day ?? "") === date)
      .reduce((sum, row) => sum + Number(row.hours ?? 0), 0);

    return {
      totalStudents,
      todayAttendance,
      onlineStudents,
      todayHours
    };
  }, [students, attendance, reports]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      {status === "loading" && (
        <p className="admin-muted">Loading dashboard...</p>
      )}
      {status === "error" && (
        <p className="admin-error">Unable to load dashboard data.</p>
      )}

      <div className="summary-row">
        <div className="summary-card">
          <p>Total Students</p>
          <h3>{metrics.totalStudents}</h3>
        </div>
        <div className="summary-card">
          <p>Today Attendance</p>
          <h3>{metrics.todayAttendance}</h3>
        </div>
        <div className="summary-card">
          <p>Online Students</p>
          <h3>{metrics.onlineStudents}</h3>
        </div>
        <div className="summary-card">
          <p>Study Hours Today</p>
          <h3>{metrics.todayHours}h</h3>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <p className="card-label">Total Students</p>
          <h3>{metrics.totalStudents}</h3>
        </div>
        <div className="card">
          <p className="card-label">Online Students</p>
          <h3>{metrics.onlineStudents}</h3>
        </div>
        <div className="card">
          <p className="card-label">Today Attendance</p>
          <h3>{metrics.todayAttendance}</h3>
        </div>
        <div className="card">
          <p className="card-label">Study Hours</p>
          <h3>{metrics.todayHours}h</h3>
        </div>
      </div>
    </div>
  );
}
