import React from "react";
import { Briefcase } from "lucide-react";

export default function Employees() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "10px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "24px", color: "#0f172a", fontWeight: 700 }}>
          Employees
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Dashboard / Employees
        </p>
      </div>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
          padding: "80px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center"
        }}
      >
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px"
        }}>
          <Briefcase size={32} color="#94a3b8" />
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 700, color: "#1e293b" }}>
          No Employees Still
        </h3>
        <p style={{ margin: 0, color: "#64748b", fontSize: "15px", maxWidth: "400px" }}>
          There are currently no employee records found in the database. Employee management features will appear here once added.
        </p>
      </div>
    </div>
  );
}
