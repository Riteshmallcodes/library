import { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { apiFetch, safeJson } from "../utils/api";

export default function ScanQR() {
  const lastValueRef = useRef("");
  const busyRef = useRef(false);
  const resetTimerRef = useRef(null);
  const rearmTimerRef = useRef(null);
  const [status, setStatus] = useState("");
  const [tone, setTone] = useState("neutral");
  const [user, setUser] = useState(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      if (rearmTimerRef.current) {
        clearTimeout(rearmTimerRef.current);
      }
    };
  }, []);

  const REARM_DELAY_MS = 2500;

  const armRescan = () => {
    if (rearmTimerRef.current) {
      clearTimeout(rearmTimerRef.current);
    }
    rearmTimerRef.current = setTimeout(() => {
      lastValueRef.current = "";
    }, REARM_DELAY_MS);
  };

  const scheduleReset = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      setStatus("");
      setTone("neutral");
      setUser(null);
      busyRef.current = false;
      lastValueRef.current = "";
    }, 3000);
  };

  const buildPayload = (value) => {
    if (!value || typeof value !== "string") return null;
    try {
      const parsed = JSON.parse(value);
      if (
        parsed &&
        typeof parsed === "object" &&
        (parsed.student_id || parsed.id)
      ) {
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  };

  const sendPayload = (value) => {
    const payload = buildPayload(value);
    if (!payload) {
      setStatus("Invalid QR code");
      setTone("error");
      busyRef.current = false;
      scheduleReset();
      return;
    }

    setStatus("Scanning...");
    setTone("neutral");

    apiFetch("/admin/scan_qr.php", {
      method: "POST",
      body: payload
    })
      .then(safeJson)
      .then((data) => {
        const person = data?.student || data?.user || data?.data || null;
        const name =
          person?.name ||
          person?.student_name ||
          data?.name ||
          data?.student_name ||
          "";
        const id =
          person?.student_id ||
          person?.id ||
          data?.student_id ||
          data?.id ||
          "";
        const message = data?.message || data?.status || "Attendance updated";

        setUser(
          name || id
            ? {
                name: name || "Unknown",
                id: id || "-"
              }
            : null
        );
        setStatus(message);
        setTone("success");
        scheduleReset();
      })
      .catch((err) => {
        setStatus(err?.message || "Unable to mark attendance");
        setTone("error");
        scheduleReset();
      });
  };

  const handleScan = (detectedCodes) => {
    if (!Array.isArray(detectedCodes) || detectedCodes.length === 0) return;

    const value = detectedCodes[0]?.rawValue;
    if (!value || busyRef.current) return;

    armRescan();
    if (value === lastValueRef.current) return;

    lastValueRef.current = value;
    busyRef.current = true;

    sendPayload(value);
  };

  const handleManualSubmit = () => {
    if (!manual.trim() || busyRef.current) return;
    busyRef.current = true;
    sendPayload(manual.trim());
  };

  const panelClass =
    tone === "success"
      ? "scan-panel scan-panel-success"
      : tone === "error"
      ? "scan-panel scan-panel-error"
      : "scan-panel";

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
          onError={(error) => {
            setStatus(error?.message || "Camera error");
            setTone("error");
          }}
          constraints={{ facingMode: { ideal: "environment" } }}
        />

        <div className={panelClass}>
          <p className="scan-label">
            {tone === "success"
              ? "Scan successful"
              : tone === "error"
              ? "Scan failed"
              : "Ready to scan"}
          </p>
          {user ? (
            <div className="scan-user">
              <p className="scan-name">{user.name}</p>
              <p className="scan-id">ID: {user.id}</p>
            </div>
          ) : (
            <p className="scan-id">{status || "Point the camera at a QR code."}</p>
          )}
        </div>

        <div className="admin-actions">
          <input
            className="admin-input"
            placeholder="Manual QR value"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <button className="admin-btn" onClick={handleManualSubmit} disabled={busyRef.current}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
