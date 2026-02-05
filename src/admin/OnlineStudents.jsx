import { useEffect, useMemo, useState } from "react";
import { apiFetch, safeJson } from "../utils/api";

const todayISO = () => new Date().toISOString().slice(0, 10);

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  return [];
};

const parseTime = (dateStr, timeStr) => {
  if (!timeStr) return null;
  if (typeof timeStr === "number") {
    const dt = new Date(timeStr * 1000);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  if (typeof timeStr === "string") {
    const trimmed = timeStr.trim();
    if (!trimmed) return null;
    if (trimmed.includes("T")) {
      const dt = new Date(trimmed);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    if (/^\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}/.test(trimmed)) {
      const dt = new Date(trimmed.replace(" ", "T"));
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    if (/^\d{1,2}:\d{2}/.test(trimmed)) {
      const dt = new Date(`${dateStr}T${trimmed}`);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      if (Number.isFinite(num)) {
        const dt = new Date(num * 1000);
        return Number.isNaN(dt.getTime()) ? null : dt;
      }
    }
  }
  return null;
};

const formatDuration = (ms) => {
  if (!Number.isFinite(ms) || ms < 0) return "-";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export default function OnlineStudents() {
  const [attendance, setAttendance] = useState([]);
  const [source, setSource] = useState("");
  const [studentsById, setStudentsById] = useState({});
  const [status, setStatus] = useState("loading");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const date = todayISO();

    const load = async () => {
      try {
        const studentsRes = await apiFetch("/admin/students.php").then(safeJson);
        if (!active) return;
        const map = {};
        normalizeList(studentsRes).forEach((s) => {
          const id = s.student_id ?? s.id;
          if (id) map[id] = s.name ?? s.student_name ?? s.full_name ?? "";
        });
        setStudentsById(map);

        const endpoints = [
          `/admin/attendance.php?date=${date}`,
          `/admin/study_sessions.php?date=${date}`,
          `/admin/study_sessions.php`
        ];

        for (const endpoint of endpoints) {
          try {
            const list = await apiFetch(endpoint).then(safeJson);
            if (!active) return;
            setAttendance(normalizeList(list));
            setSource(endpoint);
            setStatus("ready");
            return;
          } catch {
            // try next endpoint
          }
        }

        if (active) setStatus("error");
      } catch {
        if (!active) return;
        setStatus("error");
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const onlineRows = useMemo(() => {
    const date = todayISO();
    const map = new Map();

    attendance.forEach((row) => {
      const out = row.out_time ?? row.out ?? row.end_time ?? row.endTime;
      if (out) return;
      const id = row.student_id ?? row.studentId ?? row.id;
      if (!id) return;
      const inTime =
        row.in_time ||
        row.inTime ||
        row.start_time ||
        row.startTime ||
        row.time_in ||
        row.check_in;
      const parsed = parseTime(date, inTime);
      const prev = map.get(id);
      if (!prev || (parsed && prev.inAt && parsed > prev.inAt)) {
        map.set(id, {
          id,
          name: row.name || row.student_name || studentsById[id] || "-",
          inAt: parsed,
          rawIn: inTime || "-"
        });
      }
    });

    return Array.from(map.values());
  }, [attendance, studentsById, now]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Live</p>
          <h1>Online students</h1>
        </div>
      </div>

      {status === "loading" && (
        <p className="admin-muted">Loading online students...</p>
      )}
      {status === "error" && (
        <p className="admin-error">Unable to load online students.</p>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>In Time</th>
              <th>Online For</th>
            </tr>
          </thead>
          <tbody>
            {status === "ready" && onlineRows.length === 0 && (
              <tr>
                <td colSpan="4">No students online.</td>
              </tr>
            )}
            {onlineRows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.id}</td>
                <td>{row.rawIn ?? "-"}</td>
                <td>{row.inAt ? formatDuration(now - row.inAt.getTime()) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {status === "ready" && source && (
        <p className="admin-muted" style={{ marginTop: 12 }}>
          Source: {source}
        </p>
      )}
    </div>
  );
}
