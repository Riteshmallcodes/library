import { useEffect, useState } from "react";
import { apiFetch, safeJson } from "../utils/api";

export default function Attendance() {
  const [date, setDate] = useState("");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("idle");

  const load = (nextDate = date) => {
    setStatus("loading");
    const query = nextDate ? `?date=${encodeURIComponent(nextDate)}` : "";
    apiFetch(`/admin/attendance.php${query}`)
      .then(safeJson)
      .then((payload) => {
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.records)
          ? payload.records
          : [];
        setRows(list);
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
              <th>Date</th>
              <th>In</th>
              <th>Out</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && status === "ready" && (
              <tr>
                <td colSpan="4">No attendance records.</td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.id ?? `${row.student_id ?? "stu"}-${index}`}>
                <td>{row.student_id ?? row.studentId ?? row.id ?? "-"}</td>
                <td>{row.date ?? "-"}</td>
                <td>{row.in_time ?? row.in ?? "-"}</td>
                <td>{row.out_time ?? row.out ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
