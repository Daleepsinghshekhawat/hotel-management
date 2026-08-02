import React, { useState } from "react";
import axios from "axios";
import URL from "../api";

export default function Settings() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${URL}/users/resetPassword`, {
        email: user.email,
        password: passwordForm.newPassword,
      });
      if (response.data) {
        alert("Password updated successfully.");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s ease-in-out",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: 600,
    fontSize: "13px",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          ⚙️ Settings & System Controls
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Manage your personal credentials and verify global system values.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
        {/* Profile Card */}
        <div style={{
          background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "16px",
          padding: "28px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
        }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
            🛡️ Administrative Profile
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, display: "block" }}>Super Admin Name</span>
              <strong style={{ fontSize: "15px", color: "#1e293b", display: "block", marginTop: "2px" }}>{user.name || "Super Admin"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, display: "block" }}>Associated Email</span>
              <strong style={{ fontSize: "15px", color: "#1e293b", display: "block", marginTop: "2px" }}>{user.email || "superadmin@example.com"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, display: "block" }}>Platform Access Level</span>
              <span style={{
                background: "#faf5ff",
                color: "#6b21a8",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 700,
                display: "inline-block",
                marginTop: "4px"
              }}>
                Owner (Full Super Admin)
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div style={{
          background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "16px",
          padding: "28px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
        }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
            🔒 Modify Security Credentials
          </h3>
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Current Password *</label>
              <input
                type="password"
                style={inputStyle}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>New Password *</label>
              <input
                type="password"
                style={inputStyle}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password *</label>
              <input
                type="password"
                style={inputStyle}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px",
                background: loading ? "#93c5fd" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "8px"
              }}
            >
              {loading ? "Saving Credentials..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
