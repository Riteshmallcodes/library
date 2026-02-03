export async function apiFetch(path, options = {}) {
  const envApi = import.meta.env.VITE_API_URL;
  const fallbackApi = import.meta.env.PROD ? "/api" : "";
  const API = envApi ?? fallbackApi;
  const base = path.startsWith("http")
    ? path
    : `${API}${path.startsWith("/") ? "" : "/"}${path}`;

  const opts = { ...options };
  const method = (opts.method || "GET").toUpperCase();

  if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
    opts.headers = opts.headers || {};
    if (!opts.headers["Content-Type"]) {
      opts.headers["Content-Type"] = "application/json";
    }
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(base, opts);

  if (res.status === 405 && method === "POST") {
    let retryUrl = base;
    try {
      const bodyObj = typeof opts.body === "string" ? JSON.parse(opts.body) : opts.body;
      if (bodyObj && typeof bodyObj === "object") {
        const qs = new URLSearchParams(bodyObj).toString();
        if (qs) {
          retryUrl = base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
        }
      }
    } catch {
      // ignore parse errors
    }

    return fetch(retryUrl, { method: "GET" });
  }

  return res;
}

export async function safeJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: "Invalid JSON response", raw: text };
  }
}
