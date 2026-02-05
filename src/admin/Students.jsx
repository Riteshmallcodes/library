import { useEffect, useState } from "react";
import { apiFetch, safeJson } from "../utils/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [busyId, setBusyId] = useState("");

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

  const handleDelete = async (studentId) => {
    if (!studentId || busyId) return;
    const ok = window.confirm("Delete this student?");
    if (!ok) return;
    setBusyId(studentId);
    try {
      const res = await apiFetch("/admin/delete_student.php", {
        method: "POST",
        body: { student_id: studentId }
      });
      const data = await safeJson(res);
      if (!data?.success) {
        throw new Error(data?.error || "Delete failed");
      }
      setStudents((prev) => prev.filter((s) => s.student_id !== studentId));
    } catch (err) {
      alert(err?.message || "Unable to delete student");
    } finally {
      setBusyId("");
    }
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {status === "ready" && students.length === 0 && (
              <tr>
                <td colSpan="4">No students found.</td>
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
                  <td>
                    <button
                      className="admin-btn admin-btn-ghost"
                      onClick={() => handleDelete(s.student_id)}
                      disabled={busyId === s.student_id}
                    >
                      {busyId === s.student_id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
