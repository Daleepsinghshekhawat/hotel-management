import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import URL from "../api";

const formatLocation = (location) => {
  if (!location) return "N/A";
  if (typeof location === "string") return location;
  const city = location.cityname || "";
  const district = location.district?.districtname || "";
  const state = location.state?.Statename || "";
  return [city, district, state].filter(Boolean).join(", ") || "N/A";
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    activeHotels: 0,
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      if (!user.email) return;
      setLoading(true);
      try {
        const [requestsRes, hotelsRes] = await Promise.all([
          axios.get(`${URL}/api/getHotelRequestsByAdmin/${user.email}`),
          axios.get(`${URL}/api/getHotelsByAdmin/${user.email}`),
        ]);

        const requests = requestsRes.data.result || [];
        setRecent(requests.slice(0, 5));
        setStats({
          pending: requests.filter((r) => r.status === "pending").length,
          approved: requests.filter((r) => r.status === "approved").length,
          rejected: requests.filter((r) => r.status === "rejected").length,
          activeHotels: (hotelsRes.data.result || []).length,
        });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.email]);

  const statCards = [
    { label: "Pending Approval", count: stats.pending, bg: "#fef9c3", color: "#854d0e", icon: "⏳" },
    { label: "Approved", count: stats.approved, bg: "#dcfce7", color: "#166534", icon: "✅" },
    { label: "Rejected", count: stats.rejected, bg: "#fee2e2", color: "#991b1b", icon: "❌" },
    { label: "Live Hotels", count: stats.activeHotels, bg: "#dbeafe", color: "#1d4ed8", icon: "🏨" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          Welcome, {user.name || "Admin"}
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Add hotels and track approval status from superadmin.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Loading dashboard...</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
            {statCards.map((stat) => (
              <div
                key={stat.label}
                style={{
                  flex: "1 1 160px",
                  background: stat.bg,
                  borderRadius: "14px",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <span style={{ fontSize: "28px" }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                    {stat.count}
                  </div>
                  <div style={{ fontSize: "12px", color: stat.color, fontWeight: 600, marginTop: "2px" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
            <Link
              to="/adminpage/add-hotel"
              style={{
                padding: "12px 20px",
                background: "#2563eb",
                color: "#fff",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              ➕ Add New Hotel
            </Link>
            <Link
              to="/adminpage/hotels"
              style={{
                padding: "12px 20px",
                background: "#e2e8f0",
                color: "#334155",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              🏨 View All Hotels
            </Link>
          </div>

          <h3 style={{ margin: "0 0 16px", color: "#0f172a" }}>Recent Submissions</h3>
          {recent.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
                color: "#94a3b8",
              }}
            >
              No hotel submissions yet. Add your first hotel to get started.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {recent.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    background: "#fff",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.hotelName}</div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {formatLocation(item.location)} · {item.status}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background:
                        item.status === "approved"
                          ? "#dcfce7"
                          : item.status === "rejected"
                            ? "#fee2e2"
                            : "#fef9c3",
                      color:
                        item.status === "approved"
                          ? "#166534"
                          : item.status === "rejected"
                            ? "#991b1b"
                            : "#854d0e",
                      textTransform: "capitalize",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
