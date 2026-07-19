import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import URL from "../api";
import RoomList from "../Admin/RoomList";

const formatLocation = (location) => {
  if (!location) return "N/A";
  if (typeof location === "string") return location;
  const city = location.cityname || "";
  const district = location.district?.districtname || "";
  const state = location.state?.Statename || "";
  return [city, district, state].filter(Boolean).join(", ") || "N/A";
};

export default function HotelDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [hotels, setHotels] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedHotelId, setExpandedHotelId] = useState(null);

  const [stats, setStats] = useState({
    activeHotels: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });

  const fetchData = async () => {
    if (!user.email) return;
    setLoading(true);
    try {
      const [hotelsRes, requestsRes] = await Promise.all([
        axios.get(`${URL}/api/getHotelsByAdmin/${user.email}`),
        axios.get(`${URL}/api/getRequestsByAdmin/${user.email}`),
      ]);

      const activeList = hotelsRes.data.result || [];
      const requestsList = requestsRes.data.result || [];

      setHotels(activeList);
      setRequests(requestsList);

      setStats({
        activeHotels: activeList.length,
        pendingRequests: requestsList.filter((r) => r.status === "pending").length,
        approvedRequests: requestsList.filter((r) => r.status === "approved").length,
        rejectedRequests: requestsList.filter((r) => r.status === "rejected").length,
      });
    } catch (err) {
      console.log("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.email]);

  const toggleExpandHotel = (hotelId) => {
    if (expandedHotelId === hotelId) {
      setExpandedHotelId(null);
    } else {
      setExpandedHotelId(hotelId);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          🏨 Hotel Dashboard
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Welcome back! Manage your active hotels, view requests, and control room details.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          ⏳ Loading workspace data...
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
            {[
              { label: "Active Hotels", count: stats.activeHotels, bg: "#dbeafe", color: "#1d4ed8", icon: "🏨" },
              { label: "Pending Listing Review", count: stats.pendingRequests, bg: "#fef9c3", color: "#854d0e", icon: "⏳" },
              { label: "Approved Listings", count: stats.approvedRequests, bg: "#dcfce7", color: "#166534", icon: "✅" },
              { label: "Rejected Listings", count: stats.rejectedRequests, bg: "#fee2e2", color: "#991b1b", icon: "❌" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  flex: "1 1 180px",
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
                  <div style={{ fontSize: "12px", color: stat.color, fontWeight: 600, marginTop: "4px" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
            <Link
              to="/hotel/add-hotel"
              style={{
                padding: "12px 20px",
                background: "#2563eb",
                color: "#fff",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(37,99,235,0.15)",
              }}
            >
              ➕ Add New Hotel
            </Link>
            <Link
              to="/hotel/add-room"
              style={{
                padding: "12px 20px",
                background: "#0d6efd",
                color: "#fff",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(13,110,253,0.15)",
              }}
            >
              ➕ Add New Room
            </Link>
            <Link
              to="/hotel/hotels"
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
              📋 My Listing Requests
            </Link>
          </div>

          {/* Active Hotels List */}
          <h3 style={{ margin: "0 0 20px", color: "#0f172a", fontWeight: 700 }}>
            🏨 Active Hotels & Room Inventory
          </h3>

          {hotels.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "#f8fafc",
                borderRadius: "16px",
                border: "1px dashed #cbd5e1",
                color: "#64748b",
              }}
            >
              <div style={{ fontSize: "50px", marginBottom: "16px" }}>👋</div>
              <h4 style={{ margin: "0 0 8px", fontSize: "18px", color: "#1e293b" }}>No active hotels found</h4>
              <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#64748b" }}>
                Add your first hotel to start setting up rooms and pricing.
              </p>
              <Link
                to="/hotel/add-hotel"
                style={{
                  padding: "10px 20px",
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Register a Hotel
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "24px" }}>
              {hotels.map((hotel) => {
                const isExpanded = expandedHotelId === hotel._id;
                return (
                  <div
                    key={hotel._id}
                    style={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "16px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Hotel Summary Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        padding: "20px",
                        flexWrap: "wrap",
                        borderBottom: isExpanded ? "1px solid #f1f5f9" : "none",
                        background: isExpanded ? "#f8fafc" : "transparent",
                      }}
                    >
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "12px",
                          background: "#0f172a",
                          overflow: "hidden",
                        }}
                      >
                        {hotel.image ? (
                          <img
                            src={hotel.image}
                            alt={hotel.hotelName}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              height: "100%",
                              fontSize: "32px",
                            }}
                          >
                            🏨
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: "220px" }}>
                        <h4 style={{ margin: "0 0 4px", fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>
                          {hotel.hotelName}
                        </h4>
                        <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#64748b" }}>
                          📍 {formatLocation(hotel.location)}
                        </p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                          📧 {hotel.email} &nbsp;·&nbsp; ID: <code>{hotel.registrationId}</code>
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => toggleExpandHotel(hotel._id)}
                          style={{
                            padding: "10px 18px",
                            background: isExpanded ? "#64748b" : "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          {isExpanded ? "Close Rooms" : "Manage Rooms 🔑"}
                        </button>
                      </div>
                    </div>

                    {/* Room management section displayed inline */}
                    {isExpanded && (
                      <div style={{ padding: "20px 10px", background: "#fdfdfd" }}>
                        <RoomList hotelId={hotel._id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
