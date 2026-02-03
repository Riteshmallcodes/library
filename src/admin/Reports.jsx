import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { apiFetch, safeJson } from "../utils/api";

export default function Reports() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    apiFetch("/admin/reports.php")
      .then(safeJson)
      .then((payload) => {
        if (!active) return;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.reports)
          ? payload.reports
          : [];
        setData(list);
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

  const chartData = useMemo(
    () =>
      data.map((row) => ({
        date: row.date ?? row.day ?? row.label ?? "",
        hours: Number(row.hours ?? row.total_hours ?? row.value ?? 0)
      })),
    [data]
  );

  const downloadCSV = () => {
    if (!chartData.length) return;

    const headers = ["Date", "Hours"];
    const lines = chartData.map((row) => [row.date, row.hours]);

    const csv = [headers, ...lines]
      .map((line) =>
        line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reports.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Reports</p>
          <h1>Performance summary</h1>
        </div>
        <button className="admin-btn admin-btn-ghost" onClick={downloadCSV}>
          Download CSV
        </button>
      </div>

      {status === "loading" && (
        <p className="admin-muted">Loading reports...</p>
      )}
      {status === "error" && (
        <p className="admin-error">Unable to load reports.</p>
      )}

      {status === "ready" && chartData.length === 0 && (
        <p className="admin-muted">No report data yet.</p>
      )}

      {status === "ready" && chartData.length > 0 && (
        <div className="admin-card" style={{ display: "grid", gap: 16 }}>
          <LineChart width={350} height={250} data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#2563eb" />
          </LineChart>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, index) => (
                  <tr key={`${row.date || "row"}-${index}`}>
                    <td>{row.date || "-"}</td>
                    <td>{row.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
