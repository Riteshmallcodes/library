import { useEffect, useState } from "react";

export default function Attendance() {
  const [date, setDate] = useState("");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("idle");

  const load = (nextDate = date) => {
    setStatus("loading");
    fetch(`/api/admin/attendance.php?date=${nextDate}`)
      .then((r) => r.json())
      .then((payload) => {
        setRows(Array.isArray(payload) ? payload : []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  const downloadCSV = () => {
    if (!rows.length) return;

    const headers = ["Student ID", "In Time", "Out Time"];
    const lines = rows.map((row) => [
      row.student_id ?? "",
      row.in_time ?? "",
      row.out_time ?? "-"
    ]);

    const csv = [headers, ...lines]
      .map((line) =>
        line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const label = date ? date : "all";
    link.href = url;
    link.download = `attendance-${label}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    load("");
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Attendance</p>
          <h1>Daily log</h1>
        </div>
        <div className="admin-actions">
          <input
            type="date"
            className="admin-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button className="admin-btn" onClick={() => load(date)}>
            Filter
          </button>
          <button className="admin-btn admin-btn-ghost" onClick={downloadCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {status === "loading" && (
        <p className="admin-muted">Loading attendance...</p>
      )}
      {status === "error" && (
        <p className="admin-error">Unable to load attendance.</p>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>In</th>
              <th>Out</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && status === "ready" && (
              <tr>
                <td colSpan="3">No attendance records.</td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id ?? `${row.student_id}-${row.in_time}`}>
                <td>{row.student_id}</td>
                <td>{row.in_time}</td>
                <td>{row.out_time || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
