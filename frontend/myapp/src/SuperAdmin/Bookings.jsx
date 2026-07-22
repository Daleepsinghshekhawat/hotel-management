import React from "react";

export default function Bookings() {
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          📅 Platform Bookings Management
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Track and review room reservation requests, status logs, and transaction invoices.
        </p>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "60px 40px",
          border: "1px solid #e2e8f0",
          textAlign: "center",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>📅</div>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>
          No Active Bookings Recorded
        </h3>
        <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "480px", margin: "0 auto 24px", lineHeight: "1.6" }}>
          There are currently no active room reservations logged in the database. When guests complete a checkout, booking logs will compile here dynamically.
        </p>
        <button
          onClick={() => alert("Booking module initialized.")}
          style={{
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontWeight: 600,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)"
          }}
        >
          Check System Integration
        </button>
      </div>
    </div>
  );
}
