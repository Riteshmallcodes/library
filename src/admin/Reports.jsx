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
        setData(Array.isArray(payload) ? payload : []);
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
        date: row.date ?? row.day ?? "",
        hours: Number(row.hours ?? 0)
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
        <div className="admin-card" style={{ width: "fit-content" }}>
          <LineChart width={350} height={250} data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="hours" stroke="#2563eb" />
          </LineChart>
        </div>
      )}
    </div>
  );
}
