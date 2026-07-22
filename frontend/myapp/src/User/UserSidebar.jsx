import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function UserSidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinkStyle = (isActive) => ({
    display: "block",
    textDecoration: "none",
    padding: "12px 16px",
    marginBottom: "8px",
    borderRadius: "10px",
    color: isActive ? "#ffffff" : "#475569",
    background: isActive ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
    fontWeight: isActive ? 700 : 500,
    transition: "all 0.2s",
  });

  return (
    <div style={{
      width: "260px",
      background: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      minHeight: "400px"
    }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "#f1f5f9", color: "#6366f1", fontSize: "28px",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px", fontWeight: 800
        }}>
          {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
        </div>
        <h3 style={{ margin: "0 0 4px", fontSize: "18px", color: "#1e293b", fontWeight: 700 }}>
          {user.name || "Guest User"}
        </h3>
        <p style={{ margin: 0, fontSize: "13px", color: "#64748b", wordBreak: "break-all" }}>
          {user.email}
        </p>
      </div>

      <div style={{ flex: 1 }}>
        <NavLink to="/user/account/bookings" style={({ isActive }) => navLinkStyle(isActive)}>
          🛎️ Active Bookings
        </NavLink>
        <NavLink to="/user/account/history" style={({ isActive }) => navLinkStyle(isActive)}>
          📋 Booking History
        </NavLink>
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "24px",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          background: "#fff",
          color: "#ef4444",
          cursor: "pointer",
          fontWeight: 600,
          transition: "all 0.2s",
        }}
      >
        Logout
      </button>
    </div>
  );
}
