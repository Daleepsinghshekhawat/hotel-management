import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import URL from "../api";
import RoomList from "../Admin/RoomList";
import { IndianRupee, BedDouble, BookOpen, Building2, TrendingUp, Hotel, Users, CheckCircle2, Key, Wrench, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  const [loading, setLoading] = useState(true);
  const [expandedHotelId, setExpandedHotelId] = useState(null);

  const [stats, setStats] = useState({
    activeHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingRequests: 0,
    totalUsers: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    maintenanceRooms: 0,
    cleaningRooms: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

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
      let occupiedCount = 0;
      let maintenanceCount = 0;
      let cleaningCount = 0;

      let allBookings = [];
      const uniqueUsers = new Set();
      const monthlyRevenue = {};
      const statusCounts = { confirmed: 0, completed: 0, cancelled: 0, pending: 0, checked_in: 0 };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch additional stats for each active hotel
      await Promise.all(activeList.map(async (hotel) => {
        try {
          const [roomsData, bookingsData] = await Promise.all([
            axios.get(`${URL}/api/getRoomsByHotel/${hotel._id}`),
            axios.get(`${URL}/api/getBookingsByHotel/${hotel._id}`)
          ]);

          const rooms = roomsData.data.result || [];
          const bookings = bookingsData.data.result || [];

          rooms.forEach(r => {
             roomsCount += (r.totalRooms || 1);
             if (r.bookingStatus === "Maintenance") {
               maintenanceCount += (r.totalRooms || 1);
             }
          });
          
          const validBookings = bookings.filter(b => b.status !== "cancelled");
          bookingsCount += validBookings.length;
          
          const bookingsWithHotel = bookings.map(b => ({ ...b, hotelName: hotel.hotelName }));
          allBookings = [...allBookings, ...bookingsWithHotel];
          
          bookings.forEach(b => {
             if (b.guestEmail) uniqueUsers.add(b.guestEmail.toLowerCase());
             
             const status = b.status || "confirmed";
             statusCounts[status] = (statusCounts[status] || 0) + 1;
             
             if (status !== "cancelled") {
                revenueSum += (b.totalAmount || 0);
                
                const date = new Date(b.checkIn || b.createdAt);
                if (!isNaN(date)) {
                  const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                  monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (b.totalAmount || 0);
                }
             }

             // Calculate occupied rooms for today
             if (status !== "cancelled" && status !== "completed") {
                const checkInDate = new Date(b.checkIn);
                checkInDate.setHours(0, 0, 0, 0);
                const checkOutDate = new Date(b.checkOut);
                checkOutDate.setHours(23, 59, 59, 999);
                if (today >= checkInDate && today <= checkOutDate) {
                   occupiedCount += (b.roomsCount || 1); 
                }
             }

             // Calculate cleaning (proxy: checkout is today)
             if (status !== "cancelled") {
                const checkOutDateClean = new Date(b.checkOut);
                checkOutDateClean.setHours(0, 0, 0, 0);
                if (today.getTime() === checkOutDateClean.getTime()) {
                   cleaningCount += (b.roomsCount || 1);
                }
             }
          });
        } catch (e) {
          console.error(`Error fetching stats for hotel ${hotel._id}:`, e);
        }
      }));

      const revDataArray = Object.keys(monthlyRevenue).map(month => ({
        name: month,
        revenue: monthlyRevenue[month]
      }));
      
      const statDataArray = Object.keys(statusCounts)
        .filter(key => statusCounts[key] > 0)
        .map(key => ({
           name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
           value: statusCounts[key]
        }));
      
      setRevenueData(revDataArray);
      setStatusData(statDataArray);

      allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentBookings(allBookings.slice(0, 10));

      setHotels(activeList);

      setStats({
        activeHotels: activeList.length,
        totalRooms: roomsCount,
        totalBookings: bookingsCount,
        totalRevenue: revenueSum,
        pendingRequests: requestsList.filter((r) => r.status === "pending").length,
        totalUsers: uniqueUsers.size,
        occupiedRooms: occupiedCount,
        availableRooms: Math.max(0, roomsCount - occupiedCount - maintenanceCount),
        maintenanceRooms: maintenanceCount,
        cleaningRooms: cleaningCount,
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
          Hotel Owner Dashboard
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Welcome back, {user.name || "Owner"}! Manage your hotels, view revenue, and control inventory.
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
            <div style={kpiCardStyle}>
              <div style={kpiIconWrapper("#ffedd5", "#ea580c")}><Users size={20} /></div>
              <div>
                <div style={kpiLabelStyle}>Total Users</div>
                <div style={kpiValueStyle}>{stats.totalUsers.toLocaleString()}</div>
              </div>
            </div>
            <div style={kpiCardStyle}>
              <div style={kpiIconWrapper("#fce7f3", "#db2777")}><Key size={20} /></div>
              <div>
                <div style={kpiLabelStyle}>Occupied Rooms</div>
                <div style={kpiValueStyle}>{stats.occupiedRooms}</div>
              </div>
            </div>
            <div style={kpiCardStyle}>
              <div style={kpiIconWrapper("#ecfdf5", "#059669")}><CheckCircle2 size={20} /></div>
              <div>
                <div style={kpiLabelStyle}>Available Rooms</div>
                <div style={kpiValueStyle}>{stats.availableRooms}</div>
              </div>
            </div>
            <div style={kpiCardStyle}>
              <div style={kpiIconWrapper("#f1f5f9", "#475569")}><Wrench size={20} /></div>
              <div>
                <div style={kpiLabelStyle}>Maintenance</div>
                <div style={kpiValueStyle}>{stats.maintenanceRooms}</div>
              </div>
            </div>
            <div style={kpiCardStyle}>
              <div style={kpiIconWrapper("#e0f2fe", "#0284c7")}><Sparkles size={20} /></div>
              <div>
                <div style={kpiLabelStyle}>To Be Cleaned</div>
                <div style={kpiValueStyle}>{stats.cleaningRooms}</div>
              </div>
            </div>
            
          </div>

          {/* Analytics Section */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ margin: "0 0 16px", color: "#0f172a", fontWeight: 700, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={20} color="#3b82f6" />
              Analytics Overview
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {/* Revenue Chart */}
              <div style={{ background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                <h4 style={{ margin: "0 0 20px", fontSize: "15px", color: "#475569", fontWeight: 600 }}>Monthly Revenue Trend</h4>
                <div style={{ height: "300px", width: "100%" }}>
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip 
                          cursor={{ fill: "#f1f5f9" }}
                          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                        />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "14px" }}>No revenue data available</div>
                  )}
                </div>
              </div>

              {/* Status Chart */}
              <div style={{ background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                <h4 style={{ margin: "0 0 20px", fontSize: "15px", color: "#475569", fontWeight: 600 }}>Bookings by Status</h4>
                <div style={{ height: "300px", width: "100%" }}>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => {
                            const colors = ["#10b981", "#3b82f6", "#f43f5e", "#f59e0b", "#8b5cf6"];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", color: "#475569" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "14px" }}>No status data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings Section */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ margin: "0 0 16px", color: "#0f172a", fontWeight: 700, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={20} color="#3b82f6" />
              Recent Bookings
            </h3>
            
            <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                  <thead style={{ background: "#f8fafc" }}>
                    <tr>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>Guest</th>
                      <th style={thStyle}>Hotel</th>
                      <th style={thStyle}>Dates</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length > 0 ? (
                      recentBookings.map((b) => (
                        <tr key={b._id} style={{ borderTop: "1px solid #e2e8f0", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseOut={(e) => e.currentTarget.style.background = "#fff"}>
                          <td style={tdStyle}><code>{b.bookingId || "N/A"}</code></td>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 600, color: "#1e293b" }}>{b.guestName}</div>
                            <div style={{ fontSize: "13px", color: "#64748b" }}>{b.guestEmail}</div>
                          </td>
                          <td style={tdStyle}>{b.hotelName}</td>
                          <td style={tdStyle}>
                            <div style={{ fontSize: "13px" }}>In: {new Date(b.checkIn).toLocaleDateString()}</div>
                            <div style={{ fontSize: "13px" }}>Out: {new Date(b.checkOut).toLocaleDateString()}</div>
                          </td>
                          <td style={tdStyle}>
                            <span style={{
                              padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                              background: b.status === 'confirmed' ? '#dcfce7' : b.status === 'cancelled' ? '#fee2e2' : b.status === 'completed' ? '#dbeafe' : '#fef9c3',
                              color: b.status === 'confirmed' ? '#16a34a' : b.status === 'cancelled' ? '#dc2626' : b.status === 'completed' ? '#2563eb' : '#ca8a04',
                            }}>
                              {(b.status || "confirmed").toUpperCase()}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>₹{(b.totalAmount || 0).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>No recent bookings found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
                        {hotel.images?.[0] ? (
                          <img
                            src={hotel.images?.[0].startsWith("http") ? hotel.images?.[0] : `${URL}/${hotel.images?.[0].replace(/\\/g, '/')}`}
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

const thStyle = {
  padding: "16px 20px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tdStyle = {
  padding: "16px 20px",
  fontSize: "14px",
  color: "#334155"
};
