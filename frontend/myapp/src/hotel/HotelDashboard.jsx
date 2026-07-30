import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import URL from "../api";
import RoomList from "../Admin/RoomList";
import { IndianRupee, BedDouble, BookOpen, Building2, TrendingUp, Hotel } from "lucide-react";

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
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingRequests: 0,
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

      let roomsCount = 0;
      let bookingsCount = 0;
      let revenueSum = 0;

      // Fetch additional stats for each active hotel
      await Promise.all(activeList.map(async (hotel) => {
        try {
          const [roomsData, bookingsData] = await Promise.all([
            axios.get(`${URL}/api/getRoomsByHotel/${hotel._id}`),
            axios.get(`${URL}/api/getBookingsByHotel/${hotel._id}`)
          ]);

          const rooms = roomsData.data.result || [];
          const bookings = bookingsData.data.result || [];

          roomsCount += rooms.length;
          
          const validBookings = bookings.filter(b => b.status !== "cancelled");
          bookingsCount += validBookings.length;
          
          validBookings.forEach(b => {
            revenueSum += (b.totalAmount || 0);
          });
        } catch (e) {
          console.error(`Error fetching stats for hotel ${hotel._id}:`, e);
        }
      }));

      setHotels(activeList);
      setRequests(requestsList);

      setStats({
        activeHotels: activeList.length,
        totalRooms: roomsCount,
        totalBookings: bookingsCount,
        totalRevenue: revenueSum,
        pendingRequests: requestsList.filter((r) => r.status === "pending").length,
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
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "10px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "24px", color: "#0f172a", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
          <Building2 size={24} color="#3b82f6" />
          Partner Dashboard
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Welcome back, {user.name || "Partner"}! Manage your hotels, view revenue, and control inventory.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          Loading dashboard metrics...
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
            
            <div style={kpiCardStyle}>
              <div style={kpiIconWrapper("#dcfce7", "#16a34a")}><IndianRupee size={20} /></div>
              <div>
                <div style={kpiLabelStyle}>Total Revenue</div>
                <div style={kpiValueStyle}>₹{stats.totalRevenue.toLocaleString()}</div>
              </div>
            </div>

            <div style={kpiCardStyle}>
              <div style={kpiIconWrapper("#e0e7ff", "#4f46e5")}><BookOpen size={20} /></div>
              <div>
                <div style={kpiLabelStyle}>Total Bookings</div>
                <div style={kpiValueStyle}>{stats.totalBookings.toLocaleString()}</div>
              </div>
            </div>

            <div style={kpiCardStyle}>
              <div style={kpiIconWrapper("#dbeafe", "#2563eb")}><Building2 size={20} /></div>
              <div>
                <div style={kpiLabelStyle}>Active Hotels</div>
                <div style={kpiValueStyle}>{stats.activeHotels}</div>
              </div>
            </div>

            <div style={kpiCardStyle}>
              <div style={kpiIconWrapper("#f3e8ff", "#9333ea")}><BedDouble size={20} /></div>
              <div>
                <div style={kpiLabelStyle}>Total Rooms</div>
                <div style={kpiValueStyle}>{stats.totalRooms}</div>
              </div>
            </div>
            
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
                display: "flex", alignItems: "center", gap: "8px"
              }}
            >
              ➕ Add New Hotel
            </Link>
            <Link
              to="/hotel/hotels"
              style={{
                padding: "12px 20px",
                background: "#fff",
                border: "1px solid #cbd5e1",
                color: "#334155",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
                display: "flex", alignItems: "center", gap: "8px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              📋 View Requests ({stats.pendingRequests} Pending)
            </Link>
          </div>

          
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <Hotel size={20} color="#0f172a" />
            <h3 style={{ margin: 0, color: "#0f172a", fontWeight: 700, fontSize: "18px" }}>
              Active Properties & Room Inventory
            </h3>
          </div>

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
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
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
                        borderBottom: isExpanded ? "1px solid #e2e8f0" : "none",
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
                            src={hotel.image.startsWith("http") ? hotel.image : `${URL}/${hotel.image.replace(/\\/g, '/')}`}
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
                            <Building2 size={32} color="#475569" />
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
                            background: isExpanded ? "#e2e8f0" : "#2563eb",
                            color: isExpanded ? "#334155" : "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "all 0.2s"
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

const kpiCardStyle = {
  background: "#fff",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  display: "flex",
  alignItems: "center",
  gap: "16px"
};

const kpiIconWrapper = (bg, color) => ({
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  background: bg,
  color: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
});

const kpiLabelStyle = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "4px"
};

const kpiValueStyle = {
  fontSize: "24px",
  fontWeight: 800,
  color: "#0f172a"
};
