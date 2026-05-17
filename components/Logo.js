import React, { useState } from "react";

export default function Logo({ size = 36, style: extraStyle = {}, admin = false }) {
  const [err, setErr] = useState(false);
  const base = { width: size, height: size, borderRadius: 8, flexShrink: 0 };
  if (err) {
    const fb = admin
      ? { background: "rgba(37,99,235,0.1)", color: "#2563eb" }
      : { background: "rgba(255,255,255,0.15)", color: "#fff" };
    return (
      <div style={{ ...base, ...fb, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: Math.round(size * 0.48), ...extraStyle }}>VF</div>
    );
  }
  return (
    <img src="/logo.png" alt="Logo" style={{ ...base, objectFit: "contain", ...extraStyle }}
      onError={() => setErr(true)}
    />
  );
}