import React, { useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [hotelsOpen, setHotelsOpen] = useState(false);
  const [adminsOpen, setAdminsOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const navLinkStyle = (isActive) => ({
    display: "block",
    textDecoration: "none",
    padding: "10px 14px",
    marginBottom: "4px",
    borderRadius: "8px",
    color: isActive ? "#ffffff" : "#94a3b8",
    background: isActive ? "#2563eb" : "transparent",
    fontWeight: isActive ? 600 : 500,
    fontSize: "14px",
    transition: "all 0.2s ease",
  });

  const subNavLinkStyle = (isActive) => ({
    display: "block",
    textDecoration: "none",
    padding: "8px 12px 8px 36px",
    marginBottom: "4px",
    borderRadius: "8px",
    color: isActive ? "#ffffff" : "#64748b",
    background: isActive ? "rgba(37, 99, 235, 0.15)" : "transparent",
    borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
    fontWeight: isActive ? 600 : 500,
    fontSize: "13px",
    transition: "all 0.2s ease",
  });

  const sectionHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    background: "transparent",
    border: "none",
    padding: "10px 14px",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    textAlign: "left",
    borderRadius: "8px",
    marginBottom: "4px",
    outline: "none",
    transition: "all 0.2s ease",
  };

  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f8fafc",
        padding: "24px 16px",
        boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>
          Super Admin
        </h2>
        <p
          style={{
            margin: "0 0 24px",
            color: "#64748b",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            fontWeight: 700,
          }}
        >
          Control Panel
        </p>

        {/* General Links */}
        <NavLink to="/superadmin/dashboard" style={({ isActive }) => navLinkStyle(isActive)}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/superadmin/state" style={({ isActive }) => navLinkStyle(isActive)}>
          🗺️ States
        </NavLink>
        <NavLink to="/superadmin/district" style={({ isActive }) => navLinkStyle(isActive)}>
          🏙️ Districts
        </NavLink>
        <NavLink to="/superadmin/city" style={({ isActive }) => navLinkStyle(isActive)}>
          🌆 Cities
        </NavLink>

        {/* Collapsible Hotels Section */}
        <div style={{ margin: "8px 0" }}>
          <button
            onClick={() => setHotelsOpen(!hotelsOpen)}
            style={sectionHeaderStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1e293b")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span>🏨 Hotels</span>
            <span>{hotelsOpen ? "▼" : "▶"}</span>
          </button>
          {hotelsOpen && (
            <div style={{ marginTop: "2px", display: "flex", flexDirection: "column" }}>
              <NavLink to="/superadmin/add-hotel" style={({ isActive }) => subNavLinkStyle(isActive)}>
                ➕ Add Hotel
              </NavLink>
              <NavLink to="/superadmin/hotel-requests" style={({ isActive }) => subNavLinkStyle(isActive)}>
                ⏳ Hotel Requests
              </NavLink>
              <NavLink to="/superadmin/approved" style={({ isActive }) => subNavLinkStyle(isActive)}>
                ✅ Approved Hotels
              </NavLink>
            </div>
          )}
        </div>

        {/* Collapsible Admins Section */}
        <div style={{ margin: "8px 0" }}>
          <button
            onClick={() => setAdminsOpen(!adminsOpen)}
            style={sectionHeaderStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1e293b")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span>🛡️ Admins</span>
            <span>{adminsOpen ? "▼" : "▶"}</span>
          </button>
          {adminsOpen && (
            <div style={{ marginTop: "2px", display: "flex", flexDirection: "column" }}>
              <NavLink to="/superadmin/admins/add" style={({ isActive }) => subNavLinkStyle(isActive)}>
                👤 Add Admin
              </NavLink>
              <NavLink to="/superadmin/admins/requests" style={({ isActive }) => subNavLinkStyle(isActive)}>
                ⏳ Admin Requests
              </NavLink>
              <NavLink to="/superadmin/admins/all" style={({ isActive }) => subNavLinkStyle(isActive)}>
                👥 All Admins
              </NavLink>
            </div>
          )}
        </div>

        {/* Users Link */}
        <NavLink to="/superadmin/users" style={({ isActive }) => navLinkStyle(isActive)}>
          👥 Users
        </NavLink>

        {/* Bookings Link */}
        <NavLink to="/superadmin/bookings" style={({ isActive }) => navLinkStyle(isActive)}>
          📅 Bookings
        </NavLink>

        {/* Settings Link */}
        <NavLink to="/superadmin/settings" style={({ isActive }) => navLinkStyle(isActive)}>
          ⚙️ Settings
        </NavLink>
      </div>

      <button
        onClick={handleLogout}
        style={{
          width: "100%",
          padding: "11px",
          borderRadius: "8px",
          border: "none",
          background: "#ef4444",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "13px",
          marginTop: "20px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}
      >
        🚪 Logout
      </button>
    </div>
  );
}

export default Sidebar;
