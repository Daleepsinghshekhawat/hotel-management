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
    color: isActive ? "#050505" : "#a1a1aa",
    background: isActive ? "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)" : "transparent",
    fontWeight: isActive ? 700 : 500,
    transition: "all 0.2s",
  });

  return (
    <div style={{
      width: "260px",
      background: "#0a0a0c",
      border: "1px solid #1f1f22",
      borderRadius: "16px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      minHeight: "400px"
    }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "rgba(234, 179, 8, 0.1)", color: "#eab308", fontSize: "28px",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px", fontWeight: 800, border: "1px solid rgba(234, 179, 8, 0.2)"
        }}>
          {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
        </div>
        <h3 style={{ margin: "0 0 4px", fontSize: "18px", color: "#fff", fontWeight: 700 }}>
          {user.name || "Guest User"}
        </h3>
        <p style={{ margin: 0, fontSize: "13px", color: "#a1a1aa", wordBreak: "break-all" }}>
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
          border: "1px solid rgba(239, 68, 68, 0.3)",
          background: "rgba(239, 68, 68, 0.1)",
          color: "#f87171",
          cursor: "pointer",
          fontWeight: 600,
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
      >
        Logout
      </button>
    </div>
  );
}
