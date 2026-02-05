import { useEffect, useState } from "react";
import { apiFetch, safeJson } from "../utils/api";

const todayISO = () => new Date().toISOString().slice(0, 10);

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  return [];
};

export default function AdminContact() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [source, setSource] = useState("/admin/admincontact.php");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setStatus("loading");
      const endpoints = ["/admin/admincontact.php"];
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          const res = await apiFetch(endpoint);
          const data = await safeJson(res);
          if (!active) return;
          setRows(normalizeList(data));
          setSource(endpoint);
          setStatus("ready");
          return;
        } catch (err) {
          lastError = err;
        }
      }

      if (active) {
        setRows([]);
        setStatus("error");
      }
      return lastError;
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Contact</p>
          <h1>Contact requests</h1>
        </div>
      </div>

      {status === "loading" && (
        <p className="admin-muted">Loading contact data...</p>
      )}
      {status === "error" && (
        <p className="admin-error">
          Unable to load contact data. Check API endpoint.
        </p>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {status === "ready" && rows.length === 0 && (
              <tr>
                <td colSpan="4">No contact requests.</td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.id ?? `${row.email ?? "contact"}-${index}`}>
                <td>{row.name ?? row.full_name ?? row.username ?? "-"}</td>
                <td>{row.phone ?? row.mobile ?? row.contact ?? "-"}</td>
                <td>{row.message ?? row.query ?? row.notes ?? "-"}</td>
                <td>{row.date ?? row.created_at ?? row.createdAt ?? todayISO()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {status === "ready" && (
        <p className="admin-muted" style={{ marginTop: 12 }}>
          Source: {source}
        </p>
      )}
    </div>
  );
}
