import { useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { apiFetch } from "../utils/api";

export default function ScanQR() {
  const lastValueRef = useRef("");
  const [status, setStatus] = useState("");
  const [manual, setManual] = useState("");

  const sendPayload = (value) => {
    let payload = { qr: value };
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        payload = parsed;
      }
    } catch {
      payload = { qr: value };
    }

    setStatus("Sending...");

    apiFetch("/admin/scan_qr.php", {
      method: "POST",
      body: payload
    })
      .then(() => {
        setStatus("Attendance updated");
      })
      .catch(() => {
        setStatus("Unable to mark attendance");
      });
  };

  const handleScan = (detectedCodes) => {
    if (!Array.isArray(detectedCodes) || detectedCodes.length === 0) return;

    const value = detectedCodes[0]?.rawValue;
    if (!value || value === lastValueRef.current) return;

    lastValueRef.current = value;
    setTimeout(() => {
      if (lastValueRef.current === value) {
        lastValueRef.current = "";
      }
    }, 4000);

    sendPayload(value);
  };

  const handleManualSubmit = () => {
    if (!manual.trim()) return;
    sendPayload(manual.trim());
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Scan</p>
          <h1>Scan QR</h1>
        </div>
      </div>

      <div className="admin-card" style={{ display: "grid", gap: 16 }}>
        <Scanner
          onScan={handleScan}
          onError={(error) => setStatus(error?.message || "Camera error")}
          constraints={{ facingMode: { ideal: "environment" } }}
        />

        <div className="admin-actions">
          <input
            className="admin-input"
            placeholder="Manual QR value"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <button className="admin-btn" onClick={handleManualSubmit}>
            Submit
          </button>
        </div>

        {status && <p className="admin-muted">{status}</p>}
      </div>
    </div>
  );
}
