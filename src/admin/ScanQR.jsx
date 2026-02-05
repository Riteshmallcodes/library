import { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { apiFetch, safeJson } from "../utils/api";

export default function ScanQR() {
  const lastValueRef = useRef("");
  const lastScanAtRef = useRef(0);
  const lastByIdRef = useRef({});
  const busyRef = useRef(false);
  const resetTimerRef = useRef(null);
  const rearmTimerRef = useRef(null);
  const [status, setStatus] = useState("");
  const [tone, setTone] = useState("neutral");
  const [user, setUser] = useState(null);
  const [armed, setArmed] = useState(false);

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

  const REARM_DELAY_MS = 1500;
  const DUPLICATE_WINDOW_MS = 1200;
  const MIN_OUT_DELAY_MS = 60000;

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
      setArmed(false);
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

  const normalizeResultMessage = (data) => {
    const action =
      data?.action ||
      data?.type ||
      data?.status ||
      data?.result ||
      "";

    if (typeof action === "string") {
      const lower = action.toLowerCase();
      if (lower.includes("already") && lower.includes("in")) return "Already IN";
      if (lower === "in" || lower.includes("check in")) return "IN";
      if (lower === "out" || lower.includes("check out")) return "OUT";
    }

    return data?.message || data?.status || "Attendance updated";
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

    const studentId = payload.student_id || payload.id;
    if (studentId) {
      const last = lastByIdRef.current[studentId];
      if (last?.action === "IN" && Date.now() - last.at < MIN_OUT_DELAY_MS) {
        setStatus("Already IN");
        setTone("neutral");
        setUser({ name: last.name || "Student", id: studentId });
        busyRef.current = false;
        scheduleReset();
        return;
      }
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
          payload.student_id ||
          payload.id ||
          "";

        const message = normalizeResultMessage(data);
        const action =
          typeof data?.status === "string"
            ? data.status.toUpperCase()
            : typeof data?.action === "string"
            ? data.action.toUpperCase()
            : "";

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
        if (id && (action === "IN" || action === "OUT")) {
          lastByIdRef.current[id] = {
            action,
            at: Date.now(),
            name
          };
        }
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
    if (!armed || busyRef.current) return;

    const value = detectedCodes[0]?.rawValue;
    if (!value) return;

    const now = Date.now();
    if (value === lastValueRef.current && now - lastScanAtRef.current < DUPLICATE_WINDOW_MS) {
      return;
    }

    armRescan();
    lastValueRef.current = value;
    lastScanAtRef.current = now;
    busyRef.current = true;

    sendPayload(value);
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

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="admin-btn"
            onClick={() => {
              if (busyRef.current) return;
              setArmed(true);
              setStatus("Ready to scan");
              setTone("neutral");
            }}
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              fontWeight: 700,
              fontSize: 16
            }}
          >
            Scan
          </button>
        </div>

        <div className={panelClass}>
          <p className="scan-label">
            {tone === "success"
              ? "Scan successful"
              : tone === "error"
              ? "Scan failed"
              : armed
              ? "Ready to scan"
              : "Tap Scan to start"}
          </p>
          {user ? (
            <div className="scan-user">
              <p className="scan-name">{user.name}</p>
              <p className="scan-id">ID: {user.id}</p>
              {status ? <p className="scan-id">{status}</p> : null}
            </div>
          ) : (
            <p className="scan-id">{status || "Point the camera at a QR code."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
