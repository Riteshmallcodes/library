import { useEffect, useState } from "react";
import { apiFetch, safeJson } from "../utils/api";

export default function Attendance() {
  const [date, setDate] = useState("");
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("idle");
  const [studentsById, setStudentsById] = useState({});

  const pickFirst = (row, keys) => {
    for (const key of keys) {
      if (row?.[key] != null && row?.[key] !== "") return row[key];
    }
    return null;
  };

  const normalizeTime = (value) => {
    if (value == null) return "-";
    if (typeof value === "number") {
      const dt = new Date(value * 1000);
      return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleTimeString();
    }
    if (typeof value === "object") {
      const nested =
        value.time ||
        value.value ||
        value.timestamp ||
        value.datetime ||
        value.dateTime ||
        null;
      return normalizeTime(nested);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return "-";
      // If it already looks like a time, show as-is
      if (/^\d{1,2}:\d{2}/.test(trimmed)) return trimmed;
      const dt = new Date(trimmed);
      return Number.isNaN(dt.getTime()) ? trimmed : dt.toLocaleTimeString();
    }
    return String(value);
  };

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

    const headers = ["Student Name", "Student ID", "Date", "Time"];
    const lines = rows.map((row) => [
      row.name ?? row.student_name ?? studentsById[row.student_id] ?? "",
      row.student_id ?? "",
      row.date ?? row.attendance_date ?? row.day ?? "",
      normalizeTime(
        pickFirst(row, [
          "in_time",
          "inTime",
          "start_time",
          "startTime",
          "time_in",
          "check_in",
          "created_at",
          "createdAt"
        ])
      )
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
    apiFetch("/admin/students.php")
      .then(safeJson)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const map = {};
        list.forEach((s) => {
          const id = s.student_id ?? s.id;
          if (id) map[id] = s.name ?? s.student_name ?? s.full_name ?? "";
        });
        setStudentsById(map);
      })
      .catch(() => {});
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
              <th>Name</th>
              <th>ID</th>
              <th>Date</th>
              <th>Time</th>
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
                <td>
                  {row.name ??
                    row.student_name ??
                    studentsById[row.student_id] ??
                    "-"}
                </td>
                <td>{row.student_id ?? row.studentId ?? row.id ?? "-"}</td>
                <td>{row.date ?? row.attendance_date ?? row.day ?? "-"}</td>
                <td>
                  {normalizeTime(
                    pickFirst(row, [
                      "in_time",
                      "inTime",
                      "start_time",
                      "startTime",
                      "time_in",
                      "check_in",
                      "created_at",
                      "createdAt"
                    ])
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
