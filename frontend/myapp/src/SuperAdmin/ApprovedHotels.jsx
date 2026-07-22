import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "../api";

const formatLocation = (location) => {
  if (!location) return "N/A";
  if (typeof location === "string") return location;
  const city = location.cityname || "";
  const district = location.district?.districtname || "";
  const state = location.state?.Statename || "";
  return [city, district, state].filter(Boolean).join(", ") || "N/A";
};

export default function ApprovedHotels() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/getHotelsByStatus/active`);
      setHotels(res.data.result || []);
    } catch (err) {
      console.error(err);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel listing? This will remove it permanently.")) return;
    setActionLoading(id);
    try {
      const res = await axios.delete(`${URL}/api/deleteHotel/${id}`);
      if (res.data.success) {
        alert("Hotel deleted successfully.");
        fetchHotels();
      } else {
        alert("Failed to delete hotel.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting hotel.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Are you sure you want to DELETE ALL ${hotels.length} hotels? This cannot be undone.`)) return;
    setActionLoading("all");
    try {
      const res = await axios.delete(`${URL}/api/deleteAllHotels`);
      if (res.data.success) {
        alert("All hotels deleted successfully.");
        fetchHotels();
      } else {
        alert("Failed to delete all hotels.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting all hotels.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = hotels.filter(
    (h) =>
      (h.hotelName || "").toLowerCase().includes(search.toLowerCase()) ||
      (h.ownerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (h.email || "").toLowerCase().includes(search.toLowerCase()) ||
      formatLocation(h.location).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
            ✅ Approved Live Hotels
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            View and manage approved active hotel listings on the platform.
          </p>
        </div>
        {hotels.length > 0 && (
          <button
            onClick={handleDeleteAll}
            disabled={actionLoading === "all"}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#dc2626",
              color: "#fff",
              cursor: actionLoading === "all" ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: "13px",
              opacity: actionLoading === "all" ? 0.7 : 1,
            }}
          >
            {actionLoading === "all" ? "Deleting All..." : `🗑️ Delete All (${hotels.length})`}
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="🔍 Search approved hotels by name, owner, city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          marginBottom: "24px",
          boxSizing: "border-box",
          fontSize: "14px",
          outline: "none",
          background: "#f8fafc",
        }}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          ⏳ Loading approved listings...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          No approved hotels found.
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Hotel Name</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Owner Info</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Location</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Registration ID</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hotel) => (
                <tr key={hotel._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "#1e293b" }}>{hotel.hotelName}</td>
                  <td style={{ padding: "16px 20px", color: "#475569" }}>
                    <div>{hotel.ownerName}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{hotel.email}</div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#475569" }}>{formatLocation(hotel.location)}</td>
                  <td style={{ padding: "16px 20px", color: "#64748b", fontFamily: "monospace" }}>{hotel.registrationId}</td>
                  <td style={{ padding: "16px 20px", textAlign: "center", display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button
                      onClick={() => navigate(`/superadmin/hotels/edit/${hotel._id}`)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #d97706",
                        background: "transparent",
                        color: "#d97706",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#d97706"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d97706"; }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(hotel._id)}
                      disabled={actionLoading === hotel._id}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #dc2626",
                        background: "transparent",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#dc2626"; }}
                    >
                      {actionLoading === hotel._id ? "Deleting..." : "🗑️ Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
