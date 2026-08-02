import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import URL from "../api";
import useTheme from "../useTheme";
import { 
  Calendar, Building2, BedDouble, Users, IndianRupee, Wallet, 
  MoreVertical, Phone 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const formatLocation = (location) => {
  if (!location) return "N/A";
  if (typeof location === "string") return location;
  const city = location.cityname || "";
  const district = location.district?.districtname || "";
  const state = location.state?.Statename || "";
  return [city, district, state].filter(Boolean).join(", ") || "N/A";
};

// Colors for Donut Charts
const PIE_COLORS_STATUS = ["#10b981", "#f59e0b", "#ef4444"];
const PIE_COLORS_ROOMS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    roomsAvailable: 0,
    roomsBooked: 0,
    bookingsConfirmed: 0,
    bookingsPending: 0,
    bookingsCancelled: 0,
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [upcomingCheckins, setUpcomingCheckins] = useState([]);
  const [topHotels, setTopHotels] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  
  const [dailyData, setDailyData] = useState([]);
  const [monthlyRevData, setMonthlyRevData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme Constants based on Reference Image
  const colors = {
    bg: isDark ? "#0f172a" : "#f8fafc",
    cardBg: isDark ? "#1e293b" : "#ffffff",
    textMain: isDark ? "#f8fafc" : "#0f172a",
    textMuted: isDark ? "#94a3b8" : "#64748b",
    border: isDark ? "#334155" : "#f1f5f9",
    shadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.02)",
    gridLine: isDark ? "#334155" : "#f1f5f9",
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user.email) return;
      setLoading(true);
      try {
        const [hotelsRes, usersRes, reviewsRes] = await Promise.all([
          axios.get(`${URL}/api/getHotelsByAdmin/${user.email}`),
          axios.get(`${URL}/api/getUsersByRole/all`),
          axios.get(`${URL}/api/reviews/getAllReviews`) // assuming this gets all, we will filter
        ]);

        const activeList = hotelsRes.data.result || [];
        const adminHotelIds = activeList.map(h => h._id.toString());
        
        const allUsers = (usersRes.data.result || []).filter(
          (u) => u.role !== "admin" && u.role !== "superadmin"
        );

        let roomsCount = 0;
        let bookingsCount = 0;
        let revenueSum = 0;
        let pendingPay = 0;

        let confirmed = 0;
        let pending = 0;
        let cancelled = 0;
        let currentlyOccupiedRooms = 0;
        let todayBookings = 0;
        let todayCheckins = 0;
        let todayCheckouts = 0;

        const getLocalYYYYMMDD = (d) => {
          const dt = new Date(d);
          const offset = dt.getTimezoneOffset() * 60000;
          return new Date(dt.getTime() - offset).toISOString().split('T')[0];
        };
        const todayStr = getLocalYYYYMMDD(new Date());

        let allBookings = [];
        const hotelMap = {};
        const dailyMap = {}; // for line charts
        const monthlyMap = {}; // for bar chart

        await Promise.all(activeList.map(async (hotel) => {
          try {
            const [roomsData, bookingsData] = await Promise.all([
              axios.get(`${URL}/api/getRoomsByHotel/${hotel._id}`),
              axios.get(`${URL}/api/getBookingsByHotel/${hotel._id}`)
            ]);

            const rooms = roomsData.data.result || [];
            const bookings = bookingsData.data.result || [];

            roomsCount += rooms.length;
            bookingsCount += bookings.length;
            
            if (!hotelMap[hotel._id]) {
              hotelMap[hotel._id] = { 
                id: hotel._id,
                name: hotel.hotelName, 
                image: hotel.image || "",
                revenue: 0, 
                bookings: 0 
              };
            }

            bookings.forEach(b => {
              allBookings.push({...b, hotelName: hotel.hotelName});
              
              if (b.status === "cancelled") {
                cancelled++;
              } else if (b.status === "pending") {
                pending++;
                pendingPay += (b.totalAmount || 0); // rough estimate
              } else {
                confirmed++;
                const amt = b.totalAmount || 0;
                revenueSum += amt;
                hotelMap[hotel._id].revenue += amt;
                hotelMap[hotel._id].bookings += 1;

                // Time Series Data
                const d = new Date(b.createdAt);
                
                // Today's specific metrics
                if (b.createdAt && getLocalYYYYMMDD(b.createdAt) === todayStr) todayBookings++;
                if (b.checkInDate && getLocalYYYYMMDD(b.checkInDate) === todayStr) todayCheckins++;
                if (b.checkOutDate && getLocalYYYYMMDD(b.checkOutDate) === todayStr) todayCheckouts++;

                // Daily (Current Month)
                const dayKey = d.toLocaleString('default', { day: '2-digit', month: 'short' });
                if (!dailyMap[dayKey]) dailyMap[dayKey] = { name: dayKey, Bookings: 0, Revenue: 0 };
                dailyMap[dayKey].Bookings += 1;
                dailyMap[dayKey].Revenue += amt;

                // Currently Occupied Rooms
                if (b.checkInDate && b.checkOutDate) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const inDate = new Date(b.checkInDate);
                  inDate.setHours(0, 0, 0, 0);
                  const outDate = new Date(b.checkOutDate);
                  outDate.setHours(0, 0, 0, 0);

                  if (today >= inDate && today <= outDate) {
                    currentlyOccupiedRooms += (b.rooms || 1);
                  }
                }

                // Monthly
                const monthKey = d.toLocaleString('default', { month: 'short' });
                if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { name: monthKey, Revenue: 0 };
                monthlyMap[monthKey].Revenue += amt;
              }
            });
          } catch (e) {
            console.error(e);
          }
        }));

        // Sort bookings by date
        allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentBookings(allBookings.slice(0, 6));

        // Upcoming check-ins
        const now = new Date();
        const upcoming = allBookings
          .filter(b => b.status !== "cancelled" && new Date(b.checkInDate) >= now)
          .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
        setUpcomingCheckins(upcoming.slice(0, 5));

        // Top Hotels
        setTopHotels(Object.values(hotelMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

        // Daily Data Formatting
        const sortedDaily = Object.values(dailyMap).slice(-10); // show last 10 active days
        setDailyData(sortedDaily);

        // Monthly Data Formatting
        const monthsOrdered = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mData = monthsOrdered.map(m => ({
          name: m,
          Revenue: monthlyMap[m]?.Revenue || 0
        }));
        setMonthlyRevData(mData);

        // Reviews Filtering
        const allReviewsRaw = reviewsRes.data.result || [];
        const relevantReviews = allReviewsRaw
          .filter(r => r.hotel && adminHotelIds.includes(r.hotel._id.toString()))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentReviews(relevantReviews);

        setStats({
          totalHotels: activeList.length,
          totalUsers: allUsers.length,
          totalRooms: roomsCount,
          totalBookings: bookingsCount,
          totalRevenue: revenueSum,
          pendingPayments: pendingPay,
          bookingsConfirmed: confirmed,
          bookingsPending: pending,
          bookingsCancelled: cancelled,
          currentlyOccupiedRooms: currentlyOccupiedRooms,
          todayBookings,
          todayCheckins,
          todayCheckouts,
        });

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.email]);

  const pieDataStatus = [
    { name: 'Confirmed', value: stats.bookingsConfirmed },
    { name: 'Pending', value: stats.bookingsPending },
    { name: 'Cancelled', value: stats.bookingsCancelled },
  ];

  const pieDataRooms = [
    { name: 'Available', value: Math.max(0, stats.totalRooms - (stats.currentlyOccupiedRooms || 0)) },
    { name: 'Booked', value: stats.currentlyOccupiedRooms || 0 },
  ];

  // Dynamic Date Range
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });


  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "10px 20px", background: colors.bg, minHeight: "100vh" }}>
      
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "28px", fontWeight: 700, color: colors.textMain }}>
            Admin Overview
          </h2>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: "14px" }}>
            Welcome back, {user.name || "Admin"}! Here's what's happening with your business today.
          </p>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ background: colors.cardBg, padding: "10px 16px", borderRadius: "8px", border: `1px solid ${colors.border}`, fontSize: "14px", fontWeight: 600, color: colors.textMain }}>
            {startOfMonth} - {endOfMonth} 📅
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px", color: colors.textMuted }}>Loading dashboard...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* ROW 1: KPI CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <KpiCard title="Total Bookings" value={stats.totalBookings.toLocaleString()} trend={`${stats.bookingsConfirmed} Confirmed`} icon={<Calendar />} iconBg="#e0e7ff" iconColor="#4f46e5" colors={colors} />
            <KpiCard title="Today's Bookings" value={stats.todayBookings} trend="New Today" icon={<Calendar />} iconBg="#e0e7ff" iconColor="#4f46e5" colors={colors} />
            <KpiCard title="Today's Check-ins" value={stats.todayCheckins} trend="Arriving Today" icon={<Users />} iconBg="#f3e8ff" iconColor="#9333ea" colors={colors} />
            <KpiCard title="Today's Check-outs" value={stats.todayCheckouts} trend="Leaving Today" icon={<Building2 />} iconBg="#fef3c7" iconColor="#f59e0b" colors={colors} />
            
            <KpiCard title="Total Hotels" value={stats.totalHotels} trend="Active" icon={<Building2 />} iconBg="#dcfce7" iconColor="#10b981" colors={colors} />
            <KpiCard title="Total Rooms" value={stats.totalRooms} trend={`${Math.max(0, stats.totalRooms - (stats.currentlyOccupiedRooms || 0))} Available`} icon={<BedDouble />} iconBg="#fef3c7" iconColor="#f59e0b" colors={colors} />
            <KpiCard title="Total Customers" value={stats.totalUsers.toLocaleString()} trend="Registered" icon={<Users />} iconBg="#f3e8ff" iconColor="#9333ea" colors={colors} />
            <KpiCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} trend="Earned" icon={<IndianRupee />} iconBg="#ccfbf1" iconColor="#14b8a6" colors={colors} />
            <KpiCard title="Pending Payments" value={`₹${stats.pendingPayments.toLocaleString()}`} trend={`${stats.bookingsPending} Pending`} icon={<Wallet />} iconBg="#fee2e2" iconColor="#ef4444" colors={colors} />
          </div>

          {/* ROW 2: CHARTS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
            {/* Booking Overview Line Chart */}
            <div style={cardStyle(colors)}>
              {cardHeaderStyle(colors, "Booking Overview", "This Month")}
              <div style={{ height: "220px", marginTop: "20px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.gridLine} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: colors.textMuted }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: colors.textMuted }} />
                    <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Area type="monotone" dataKey="Bookings" stroke="#4f46e5" strokeWidth={2} fill="#e0e7ff" fillOpacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Overview Line Chart */}
            <div style={cardStyle(colors)}>
              {cardHeaderStyle(colors, "Revenue Overview", "This Month")}
              <div style={{ height: "220px", marginTop: "20px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.gridLine} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: colors.textMuted }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: colors.textMuted }} tickFormatter={(val) => typeof val === 'number' ? `₹${val/1000}k` : val} />
                    <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} fill="#dcfce7" fillOpacity={0.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Booking Status Donut */}
            <div style={cardStyle(colors)}>
              {cardHeaderStyle(colors, "Booking Status", null)}
              <div style={{ height: "220px", display: "flex", alignItems: "center" }}>
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie data={pieDataStatus} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                      {pieDataStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS_STATUS[index % PIE_COLORS_STATUS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ width: "50%", paddingLeft: "10px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: colors.textMain }}>{stats.totalBookings}</div>
                  <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "16px" }}>Total</div>
                  {pieDataStatus.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMain, fontWeight: 500 }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: PIE_COLORS_STATUS[i] }} />
                        {item.name}
                      </div>
                      <div style={{ color: colors.textMuted }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: LISTS & TABLES */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr", gap: "24px" }}>
            
            {/* Recent Bookings Table */}
            <div style={cardStyle(colors)}>
              {cardHeaderStyle(colors, "Recent Bookings", "View All")}
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px", fontSize: "13px" }}>
                <thead>
                  <tr style={{ color: colors.textMuted, borderBottom: `1px solid ${colors.border}`, textAlign: "left" }}>
                    <th style={{ padding: "12px 0", fontWeight: 500 }}>Booking ID</th>
                    <th style={{ padding: "12px 0", fontWeight: 500 }}>Customer</th>
                    <th style={{ padding: "12px 0", fontWeight: 500 }}>Hotel</th>
                    <th style={{ padding: "12px 0", fontWeight: 500 }}>Check In</th>
                    <th style={{ padding: "12px 0", fontWeight: 500 }}>Amount</th>
                    <th style={{ padding: "12px 0", fontWeight: 500 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b, i) => (
                    <tr key={i} style={{ borderBottom: i !== recentBookings.length - 1 ? `1px solid ${colors.border}` : "none", color: colors.textMain }}>
                      <td style={{ padding: "14px 0", color: "#4f46e5", fontWeight: 600 }}>#{b._id.slice(-6).toUpperCase()}</td>
                      <td style={{ padding: "14px 0" }}>{b.name}</td>
                      <td style={{ padding: "14px 0" }}>{b.hotelName}</td>
                      <td style={{ padding: "14px 0" }}>{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) : "N/A"}</td>
                      <td style={{ padding: "14px 0", fontWeight: 600 }}>₹{b.totalAmount}</td>
                      <td style={{ padding: "14px 0" }}>
                        <span style={statusBadge(b.status)}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top Hotels List */}
            <div style={cardStyle(colors)}>
              {cardHeaderStyle(colors, "Top Hotels", "View All")}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                {topHotels.map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#e2e8f0", overflow: "hidden" }}>
                        {h.image && <img src={h.image.replace(/\\/g, '/')} alt="hotel" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: colors.textMain }}>{h.name}</div>
                        <div style={{ fontSize: "12px", color: colors.textMuted }}>{h.bookings} Bookings</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: colors.textMain }}>₹{h.revenue.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews List */}
            <div style={cardStyle(colors)}>
              {cardHeaderStyle(colors, "Recent Reviews", "View All")}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                {recentReviews.length === 0 ? (
                  <div style={{ fontSize: "13px", color: colors.textMuted }}>No reviews yet.</div>
                ) : (
                  recentReviews.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#4f46e5", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", flexShrink: 0 }}>
                          {r.user?.name ? r.user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: colors.textMain, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{r.user?.name || "Guest"}</div>
                          <div style={{ fontSize: "11px", color: colors.textMuted, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{r.hotel?.hotelName}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1.5 }}>
                        <div style={{ color: "#f59e0b", fontSize: "12px", fontWeight: "bold" }}>★ {r.rating}.0</div>
                        <div style={{ fontSize: "11px", color: colors.textMuted, textAlign: "right", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                          "{r.comment}"
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ROW 4: BOTTOM WIDGETS */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 2fr", gap: "24px" }}>
            
            {/* Upcoming Check-ins */}
            <div style={cardStyle(colors)}>
              {cardHeaderStyle(colors, "Upcoming Check-ins", "View All")}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                {upcomingCheckins.length === 0 ? (
                  <div style={{ fontSize: "13px", color: colors.textMuted }}>No upcoming check-ins.</div>
                ) : (
                  upcomingCheckins.map((b, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                           <Users size={16} color="#64748b"/>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: colors.textMain }}>{b.name}</div>
                          <div style={{ fontSize: "11px", color: colors.textMuted }}>{b.hotelName}</div>
                        </div>
                      </div>
                      <div style={{ color: colors.textMain, fontWeight: 500 }}>{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) : "N/A"}</div>
                      <div style={{ color: colors.textMuted }}>{b.rooms || 1} Rooms</div>
                      <Phone size={14} color="#94a3b8" style={{ cursor: "pointer" }} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Room Status */}
            <div style={cardStyle(colors)}>
              {cardHeaderStyle(colors, "Room Status", null)}
              <div style={{ height: "220px", display: "flex", alignItems: "center" }}>
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie data={pieDataRooms} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                      {pieDataRooms.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS_ROOMS[index % PIE_COLORS_ROOMS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ width: "50%", paddingLeft: "10px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: colors.textMain }}>{stats.totalRooms}</div>
                  <div style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "16px" }}>Total Rooms</div>
                  {pieDataRooms.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: colors.textMain, fontWeight: 500 }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: PIE_COLORS_ROOMS[i] }} />
                        {item.name}
                      </div>
                      <div style={{ color: colors.textMuted }}>{item.value} ({((item.value / stats.totalRooms) * 100 || 0).toFixed(1)}%)</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Revenue Bar Chart */}
            <div style={cardStyle(colors)}>
              {cardHeaderStyle(colors, "Monthly Revenue", "View Report")}
              <div style={{ height: "220px", marginTop: "20px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.gridLine} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: colors.textMuted }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: colors.textMuted }} tickFormatter={(val) => typeof val === 'number' ? `₹${val/1000}k` : val} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// --- Dynamic Components & Styles ---

const KpiCard = ({ title, value, trend, icon, iconBg, iconColor, colors }) => (
  <div style={{ 
    background: colors.cardBg, 
    border: `1px solid ${colors.border}`, 
    borderRadius: "16px", 
    padding: "20px",
    display: "flex", 
    flexDirection: "column",
    gap: "12px",
    boxShadow: colors.shadow
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <MoreVertical size={16} color={colors.textMuted} style={{ cursor: "pointer" }} />
    </div>
    <div>
      <div style={{ fontSize: "12px", color: colors.textMuted, fontWeight: 500, marginBottom: "4px" }}>{title}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: colors.textMain, marginBottom: "4px" }}>{value}</div>
      <div style={{ fontSize: "11px", fontWeight: 600, color: trend.includes("↑") ? "#10b981" : "#64748b" }}>
        {trend}
      </div>
    </div>
  </div>
);

const cardStyle = (colors) => ({
  background: colors.cardBg,
  border: `1px solid ${colors.border}`,
  borderRadius: "16px",
  padding: "24px",
  boxShadow: colors.shadow
});

const cardHeaderStyle = (colors, title, linkText) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: colors.textMain }}>{title}</h3>
    {linkText ? (
      <span style={{ fontSize: "12px", color: "#4f46e5", fontWeight: 600, cursor: "pointer" }}>{linkText}</span>
    ) : (
      <select style={{ border: `1px solid ${colors.border}`, background: "transparent", color: colors.textMuted, borderRadius: "4px", fontSize: "11px", padding: "2px 6px" }}>
        <option>This Month</option>
      </select>
    )}
  </div>
);

const statusBadge = (status) => {
  const str = String(status || "").toLowerCase();
  const isConf = str === "confirmed" || str === "approved";
  const isPend = str === "pending";
  return {
    fontSize: "11px", 
    fontWeight: 600, 
    padding: "4px 10px",
    borderRadius: "999px", 
    background: isConf ? "rgba(16, 185, 129, 0.1)" : isPend ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
    color: isConf ? "#10b981" : isPend ? "#f59e0b" : "#ef4444",
    textTransform: "capitalize"
  };
};
