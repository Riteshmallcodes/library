import { useEffect, useState } from "react";
import { apiFetch, safeJson } from "../utils/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState("loading");

  const load = (query = "") => {
    setStatus("loading");
    apiFetch(`/admin/students.php?search=${encodeURIComponent(query)}`)
      .then(safeJson)
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    load("");
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Students</p>
          <h1>Student list</h1>
        </div>
        <input
          className="admin-input"
          placeholder="Search student"
          onChange={(e) => load(e.target.value)}
        />
      </div>

      {status === "loading" && (
        <p className="admin-muted">Loading students...</p>
      )}
      {status === "error" && (
        <p className="admin-error">Unable to load students.</p>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {status === "ready" && students.length === 0 && (
              <tr>
                <td colSpan="3">No students found.</td>
              </tr>
            )}
            {students.map((s, i) => {
              const key =
                s.student_id ?? s.email ?? `${s.name ?? "student"}-${i}`;
              return (
                <tr key={key}>
                <td>{s.student_id}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
