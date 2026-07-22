import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "../api";

export default function AddAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    mobileNumber: "",
    occupation: "",
    criminalCase: "No",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${URL}/api/addAdminDirect`, form);
      alert("Administrator created and approved successfully! Login credentials have been emailed.");
      navigate("/superadmin/admins/all");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create administrator");
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
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: "800px", margin: "20px auto" }}>
      {/* Header Section */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <span style={{
          background: "#faf5ff",
          color: "#6b21a8",
          padding: "6px 14px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          display: "inline-block",
          marginBottom: "12px"
        }}>
          🛡️ Direct Promotion
        </span>
        <h2 style={{ margin: "0 0 8px", fontSize: "26px", color: "#0f172a", fontWeight: 800 }}>
          Add Administrator Directly
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px", maxWidth: "600px", margin: "0 auto", lineHeight: "1.5" }}>
          Instantly register an approved administrator account. The system will automatically configure user rights and email login credentials.
        </p>
      </div>

      <div style={{
        background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
        borderRadius: "20px",
        padding: "40px",
        border: "1px solid #e2e8f0",
        borderTop: "6px solid #6b21a8",
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 8px 20px -6px rgba(0, 0, 0, 0.04)",
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              style={inputStyle}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Contact Email *</label>
              <input
                style={inputStyle}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Mobile Number *</label>
              <input
                style={inputStyle}
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Occupation / Designation *</label>
              <input
                style={inputStyle}
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                placeholder="e.g. Regional Manager"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Residential Address *</label>
              <input
                style={inputStyle}
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Complete address details"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Pending Criminal Case? *</label>
              <select
                style={inputStyle}
                name="criminalCase"
                value={form.criminalCase}
                onChange={handleChange}
                required
              >
                <option value="No">No (Clean Record)</option>
                <option value="Yes">Yes (Under Review)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: loading ? "#d8b4fe" : "#6b21a8",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease-in-out",
              boxShadow: "0 4px 10px rgba(107, 33, 168, 0.25)",
              marginTop: "12px"
            }}
            onMouseEnter={(e) => { if(!loading) e.currentTarget.style.background = "#581c87"; }}
            onMouseLeave={(e) => { if(!loading) e.currentTarget.style.background = "#6b21a8"; }}
          >
            {loading ? "Creating Admin..." : "🚀 Register & Activate Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
