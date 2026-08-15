import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useOutletContext, useNavigate } from "react-router-dom";
import URL from "../api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { 
  Building2, CheckCircle, Clock, Ban, 
  Calendar, Package, IndianRupee, Star,
  ArrowUpDown, Users, UserCheck, UserX, UserSearch
} from "lucide-react";

const COLORS = ["#10b981", "#ef4444", "#f59e0b"]; // Confirmed, Cancelled, Pending

export default function SuperAdminDashboard() {
  const { theme } = useOutletContext() || { theme: "light" };
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    hotels: [],
    bookings: [],
    reviews: [],
    admins: []
  });

  const [sortConfig, setSortConfig] = useState({ key: 'revenue', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [hotelsRes, bookingsRes, reviewsRes, adminsRes] = await Promise.all([
          axios.get(`${URL}/api/getAllHotels`).catch(() => ({ data: { result: [] } })),
          axios.get(`${URL}/api/getAllBookings`).catch(() => ({ data: { result: [] } })),
          axios.get(`${URL}/api/reviews/getAllReviews`).catch(() => ({ data: { result: [] } })),
          axios.get(`${URL}/api/getAllAdminRequests`).catch(() => ({ data: { result: [] } }))
        ]);

        setData({
          hotels: hotelsRes.data.result || [],
          bookings: bookingsRes.data.result || [],
          reviews: reviewsRes.data.result || [],
          admins: adminsRes.data.result || []
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- KPI Calculations ---
  const kpis = useMemo(() => {
    const { hotels, bookings, reviews, admins } = data;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeHotels = hotels.filter(h => h.status === "approved" || h.status === "active").length;
    const pendingHotels = hotels.filter(h => h.status === "pending").length;
    const blockedHotels = hotels.filter(h => ["blocked", "suspended", "rejected"].includes(h.status)).length;
    
    let todaysBookings = 0;
    let totalRevenue = 0;

    bookings.forEach(b => {
      if (!b.createdAt) return;
      const bDate = new Date(b.createdAt);
      if (bDate >= startOfToday) {
        todaysBookings++;
      }
      if (["confirmed", "completed", "checked_in"].includes(b.status)) {
        totalRevenue += (b.superadminEarnings != null ? b.superadminEarnings : (b.totalAmount || 0));
      }
    });

    let avgRating = "N/A";
    if (reviews.length > 0) {
      const validReviews = reviews.filter(r => r.rating && !isNaN(r.rating));
      if (validReviews.length > 0) {
        const sum = validReviews.reduce((acc, curr) => acc + curr.rating, 0);
        avgRating = (sum / validReviews.length).toFixed(1);
      }
    }

    const totalAdmins = admins.length;
    const approvedAdmins = admins.filter(a => a.status === "approved").length;
    const pendingAdmins = admins.filter(a => a.status === "pending").length;
    const rejectedAdmins = admins.filter(a => a.status === "rejected").length;

    return {
      totalHotels: hotels.length,
      activeHotels,
      pendingHotels,
      blockedHotels,
      todaysBookings,
      totalBookings: bookings.length,
      totalRevenue,
      avgRating,
      totalAdmins,
      approvedAdmins,
      pendingAdmins,
      rejectedAdmins
    };
  }, [data]);

  // --- Chart Data Calculations ---
  const charts = useMemo(() => {
    const { hotels, bookings } = data;
    
    // 1. Booking Trend (Line Chart) - Last 6 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const bookingTrendMap = {};
    const revenueMap = {};

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      bookingTrendMap[mName] = 0;
      revenueMap[mName] = 0;
    }

    bookings.forEach(b => {
      if (!b.createdAt) return;
      const d = new Date(b.createdAt);
      const mName = monthNames[d.getMonth()];
      if (bookingTrendMap[mName] !== undefined) {
        bookingTrendMap[mName]++;
        if (["confirmed", "completed", "checked_in"].includes(b.status)) {
          revenueMap[mName] += (b.superadminEarnings != null ? b.superadminEarnings : (b.totalAmount || 0));
        }
      }
    });

    const bookingTrendData = Object.keys(bookingTrendMap).map(k => ({ name: k, Bookings: bookingTrendMap[k] }));
    const revenueData = Object.keys(revenueMap).map(k => ({ name: k, Revenue: revenueMap[k] }));

    // 3. Booking Status (Pie)
    let completed = 0, cancelled = 0, pending = 0;
    bookings.forEach(b => {
      if (["confirmed", "completed", "checked_in"].includes(b.status)) completed++;
      else if (b.status === "cancelled") cancelled++;
      else pending++;
    });
    const bookingStatusData = [
      { name: "Completed", value: completed },
      { name: "Cancelled", value: cancelled },
      { name: "Pending", value: pending }
    ];

    // 4. Hotel Status (Horizontal Bar)
    const hotelStatusData = [
      { name: "Approved", count: kpis.activeHotels, fill: "#10b981" },
      { name: "Pending", count: kpis.pendingHotels, fill: "#f59e0b" },
      { name: "Rejected", count: kpis.blockedHotels, fill: "#ef4444" }
    ];

    // 5. Top Cities by Bookings (Horizontal Bar)
    const cityMap = {};
    bookings.forEach(b => {
      let city = "Unknown";
      const hId = b.hotel?._id || b.hotel;
      if (hId) {
        const fullHotel = hotels.find(h => h._id === hId);
        if (fullHotel && fullHotel.location && fullHotel.location.cityname) {
          city = fullHotel.location.cityname;
        } else if (fullHotel && fullHotel.city) {
          city = fullHotel.city;
        }
      }
      if (!cityMap[city]) cityMap[city] = 0;
      cityMap[city]++;
    });
    const topCitiesData = Object.keys(cityMap)
      .map(k => ({ name: k, Bookings: cityMap[k] }))
      .sort((a, b) => b.Bookings - a.Bookings)
      .slice(0, 5);

    // 6. Room Occupancy
    let totalRooms = 0;
    hotels.forEach(h => {
      totalRooms += (h.totalRooms || 0);
    });
    // Active bookings today 
    let occupiedRooms = 0;
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    bookings.forEach(b => {
      if (["confirmed", "checked_in"].includes(b.status) && b.checkInDate && b.checkOutDate) {
        const inDate = new Date(b.checkInDate);
        const outDate = new Date(b.checkOutDate);
        if (startOfToday >= inDate && startOfToday <= outDate) {
           occupiedRooms += (b.rooms || 1);
        }
      }
    });
    const occupiedPercent = totalRooms > 0 ? Math.min(100, Math.round((occupiedRooms / totalRooms) * 100)) : 0;
    const availablePercent = 100 - occupiedPercent;

    return {
      bookingTrendData,
      revenueData,
      bookingStatusData,
      hotelStatusData,
      topCitiesData,
      occupancy: { occupied: occupiedPercent, available: availablePercent, total: totalRooms, occupiedCount: occupiedRooms }
    };
  }, [data, kpis]);

  // --- Table Data Calculations ---
  const topHotelsData = useMemo(() => {
    const { hotels, bookings, reviews } = data;
    const hMap = {};

    hotels.forEach(h => {
      hMap[h._id] = { id: h._id, name: h.hotelName || "Unknown", revenue: 0, bookings: 0, rating: "N/A", rawRating: 0, reviewCount: 0 };
    });

    bookings.forEach(b => {
      const hId = b.hotel?._id || b.hotel;
      if (hMap[hId]) {
        hMap[hId].bookings++;
        if (["confirmed", "completed", "checked_in"].includes(b.status)) {
          hMap[hId].revenue += (b.superadminEarnings != null ? b.superadminEarnings : (b.totalAmount || 0));
        }
      }
    });

    

    reviews.forEach(r => {
      const hId = r.hotel?._id || r.hotel;
      if (hMap[hId] && r.rating) {
        hMap[hId].rawRating += r.rating;
        hMap[hId].reviewCount++;
      }
    });

    return Object.values(hMap).map(h => {
      if (h.reviewCount > 0) {
        h.rating = (h.rawRating / h.reviewCount).toFixed(1);
      }
      return h;
    });
  }, [data]);

  const sortedTopHotels = useMemo(() => {
    let sortableItems = [...topHotelsData];
    sortableItems.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'rating') {
        aVal = aVal === "N/A" ? -1 : parseFloat(aVal);
        bVal = bVal === "N/A" ? -1 : parseFloat(bVal);
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [topHotelsData, sortConfig]);

  const paginatedHotels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTopHotels.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTopHotels, currentPage]);

  const totalPages = Math.ceil(sortedTopHotels.length / itemsPerPage);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", color: "#94a3b8" }}>Loading Dashboard Data...</div>;
  }

  // --- Styling Constants ---
  const chartTextColor = isDark ? "#64748b" : "#94a3b8";
  const chartGridColor = isDark ? "#e2e8f0" : "#1e40af";
  const cardBg = isDark ? "#ffffff" : "#1e3a8a";
  const cardGradient = isDark 
    ? "linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)" 
    : "linear-gradient(145deg, #1e3a8a 0%, #172554 100%)";
  const borderColor = isDark ? "#e2e8f0" : "#1e40af";
  const textPrimary = isDark ? "#0f172a" : "#f8fafc";
  const textSecondary = isDark ? "#475569" : "#93c5fd";
  const pageTextPrimary = isDark ? "#f8fafc" : "#0f172a";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "20px", minHeight: "100vh" }}>
      <style>{`
        .dash-card {
          background: ${cardGradient};
          border: 1px solid ${borderColor};
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, ${isDark ? "0.4" : "0.04"});
        }
        .kpi-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: ${cardGradient};
          border: 1px solid ${borderColor};
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, ${isDark ? "0.3" : "0.03"});
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .kpi-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 4px; height: 100%;
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, ${isDark ? "0.5" : "0.08"});
        }
        .kpi-card:hover::before {
          opacity: 1;
        }
        .kpi-card.clickable {
          cursor: pointer;
        }
        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .table-th {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid ${borderColor};
          color: ${textSecondary};
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          user-select: none;
        }
        .table-th:hover { color: ${textPrimary}; }
        .table-td {
          padding: 12px;
          border-bottom: 1px solid ${borderColor};
          color: ${textPrimary};
          font-size: 14px;
        }
      `}</style>

      <h1 style={{ color: pageTextPrimary, fontSize: "24px", fontWeight: 700, margin: "0 0 24px 0" }}>
        SuperAdmin Overview
      </h1>

      {/* KPI Section - 8 Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        
        <div className="kpi-card clickable" onClick={() => navigate('/superadmin/approved')}>
          <div className="kpi-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}><Building2 size={24} /></div>
          <div>
            <div style={{ color: textSecondary, fontSize: "13px", fontWeight: 500 }}>Total Hotels</div>
            <div style={{ color: textPrimary, fontSize: "24px", fontWeight: 700 }}>{kpis.totalHotels}</div>
          </div>
        </div>

        <div className="kpi-card clickable" onClick={() => navigate('/superadmin/approved')}>
          <div className="kpi-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}><CheckCircle size={24} /></div>
          <div>
            <div style={{ color: textSecondary, fontSize: "13px", fontWeight: 500 }}>Active Hotels</div>
            <div style={{ color: textPrimary, fontSize: "24px", fontWeight: 700 }}>{kpis.activeHotels}</div>
          </div>
        </div>

        <div className="kpi-card clickable" onClick={() => navigate('/superadmin/hotel-requests')}>
          <div className="kpi-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}><Clock size={24} /></div>
          <div>
            <div style={{ color: textSecondary, fontSize: "13px", fontWeight: 500 }}>Pending Hotels</div>
            <div style={{ color: textPrimary, fontSize: "24px", fontWeight: 700 }}>{kpis.pendingHotels}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}><Ban size={24} /></div>
          <div>
            <div style={{ color: textSecondary, fontSize: "13px", fontWeight: 500 }}>Blocked Hotels</div>
            <div style={{ color: textPrimary, fontSize: "24px", fontWeight: 700 }}>{kpis.blockedHotels}</div>
          </div>
        </div>



        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}><IndianRupee size={24} /></div>
          <div>
            <div style={{ color: textSecondary, fontSize: "13px", fontWeight: 500 }}>Total Revenue</div>
            <div style={{ color: textPrimary, fontSize: "20px", fontWeight: 700 }}>₹{kpis.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="kpi-card clickable" onClick={() => navigate('/superadmin/reviews')}>
          <div className="kpi-icon" style={{ background: "rgba(234, 179, 8, 0.1)", color: "#eab308" }}><Star size={24} /></div>
          <div>
            <div style={{ color: textSecondary, fontSize: "13px", fontWeight: 500 }}>Average Rating</div>
            <div style={{ color: textPrimary, fontSize: "24px", fontWeight: 700 }}>{kpis.avgRating}</div>
          </div>
        </div>

        <div className="kpi-card clickable" onClick={() => navigate('/superadmin/all-admins')}>
          <div className="kpi-icon" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}><Users size={24} /></div>
          <div>
            <div style={{ color: textSecondary, fontSize: "13px", fontWeight: 500 }}>Total Admins</div>
            <div style={{ color: textPrimary, fontSize: "24px", fontWeight: 700 }}>{kpis.totalAdmins}</div>
          </div>
        </div>

        <div className="kpi-card clickable" onClick={() => navigate('/superadmin/all-admins')}>
          <div className="kpi-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}><UserCheck size={24} /></div>
          <div>
            <div style={{ color: textSecondary, fontSize: "13px", fontWeight: 500 }}>Approved Admins</div>
            <div style={{ color: textPrimary, fontSize: "24px", fontWeight: 700 }}>{kpis.approvedAdmins}</div>
          </div>
        </div>

        <div className="kpi-card clickable" onClick={() => navigate('/superadmin/admins/requests')}>
          <div className="kpi-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}><UserSearch size={24} /></div>
          <div>
            <div style={{ color: textSecondary, fontSize: "13px", fontWeight: 500 }}>Pending Admins</div>
            <div style={{ color: textPrimary, fontSize: "24px", fontWeight: 700 }}>{kpis.pendingAdmins}</div>
          </div>
        </div>

        <div className="kpi-card clickable" onClick={() => navigate('/superadmin/admins/requests')}>
          <div className="kpi-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}><UserX size={24} /></div>
          <div>
            <div style={{ color: textSecondary, fontSize: "13px", fontWeight: 500 }}>Rejected Admins</div>
            <div style={{ color: textPrimary, fontSize: "24px", fontWeight: 700 }}>{kpis.rejectedAdmins}</div>
          </div>
        </div>

      </div>

      {/* Row 1: Trend & Revenue */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        
        {/* 1. Booking Trend */}
        <div className="dash-card">
          <h3 style={{ margin: "0 0 20px 0", color: textPrimary, fontSize: "16px" }}>Booking Trend</h3>
          <div style={{ height: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.bookingTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartTextColor }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartTextColor }} />
                <Tooltip contentStyle={{ background: cardBg, borderColor, borderRadius: "8px", color: textPrimary }} />
                <Line type="monotone" dataKey="Bookings" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Revenue Analytics */}
        <div className="dash-card">
          <h3 style={{ margin: "0 0 20px 0", color: textPrimary, fontSize: "16px" }}>Revenue Analytics</h3>
          <div style={{ height: "250px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartTextColor }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartTextColor }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} contentStyle={{ background: cardBg, borderColor, borderRadius: "8px", color: textPrimary }} cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} />
                <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Status & Hotel Status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        
        {/* 3. Booking Status */}
        <div className="dash-card">
          <h3 style={{ margin: "0 0 20px 0", color: textPrimary, fontSize: "16px" }}>Booking Status</h3>
          <div style={{ height: "220px", display: "flex", alignItems: "center" }}>
             <ResponsiveContainer width="60%" height="100%">
               <PieChart>
                 <Pie data={charts.bookingStatusData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                   {charts.bookingStatusData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ background: cardBg, borderColor, borderRadius: "8px", color: textPrimary }} />
               </PieChart>
             </ResponsiveContainer>
             <div style={{ width: "40%", display: "flex", flexDirection: "column", gap: "12px" }}>
                {charts.bookingStatusData.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: textPrimary }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: COLORS[i] }} />
                    <span style={{ flex: 1 }}>{s.name}</span>
                    <span style={{ fontWeight: 600 }}>{s.value > 0 ? Math.round((s.value/kpis.totalBookings)*100) : 0}%</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* 4. Hotel Status */}
        <div className="dash-card">
          <h3 style={{ margin: "0 0 20px 0", color: textPrimary, fontSize: "16px" }}>Hotel Status</h3>
          <div style={{ height: "220px", paddingRight: "20px" }}>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.hotelStatusData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
                   <XAxis type="number" hide />
                   <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: chartTextColor }} />
                   <Tooltip cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} contentStyle={{ background: cardBg, borderColor, borderRadius: "8px", color: textPrimary }} />
                   <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                      {charts.hotelStatusData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Top Cities */}
      <div style={{ marginBottom: "24px" }}>
        
        {/* 5. Top Cities by Bookings */}
        <div className="dash-card">
          <h3 style={{ margin: "0 0 20px 0", color: textPrimary, fontSize: "16px" }}>Top Cities by Bookings</h3>
          <div style={{ height: "250px" }}>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.topCitiesData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
                   <XAxis type="number" hide />
                   <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: chartTextColor }} width={80} />
                   <Tooltip cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} contentStyle={{ background: cardBg, borderColor, borderRadius: "8px", color: textPrimary }} />
                   <Bar dataKey="Bookings" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Performing Hotels Table */}
      <div className="dash-card">
        <h3 style={{ margin: "0 0 20px 0", color: textPrimary, fontSize: "16px" }}>Top Performing Hotels</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="table-th" style={{ width: "40%" }}>Hotel Name</th>
                <th className="table-th" onClick={() => handleSort('revenue')}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    Revenue <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="table-th" onClick={() => handleSort('bookings')}>
                   <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    Bookings <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="table-th" onClick={() => handleSort('rating')}>
                   <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    Rating <ArrowUpDown size={14} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedHotels.map((h, i) => (
                <tr key={h.id}>
                  <td className="table-td" style={{ fontWeight: 500 }}>{h.name}</td>
                  <td className="table-td">₹{h.revenue.toLocaleString()}</td>
                  <td className="table-td">{h.bookings}</td>
                  <td className="table-td">
                    {h.rating === "N/A" ? (
                      <span style={{ color: textSecondary, fontSize: "12px" }}>N/A</span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#eab308", fontWeight: 600 }}>
                        <Star size={14} fill="#eab308" /> {h.rating}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {sortedTopHotels.length === 0 && (
                <tr>
                  <td colSpan="4" className="table-td" style={{ textAlign: "center", color: textSecondary }}>No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "8px 16px" }}>
            <div style={{ color: textSecondary, fontSize: "14px" }}>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedTopHotels.length)} of {sortedTopHotels.length} hotels
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${borderColor}`,
                  background: currentPage === 1 ? "transparent" : (isDark ? "#334155" : "#f1f5f9"),
                  color: currentPage === 1 ? textSecondary : textPrimary,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "14px"
                }}
              >
                Previous
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      border: currentPage === i + 1 ? "none" : `1px solid ${borderColor}`,
                      background: currentPage === i + 1 ? "#3b82f6" : "transparent",
                      color: currentPage === i + 1 ? "#fff" : textPrimary,
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${borderColor}`,
                  background: currentPage === totalPages ? "transparent" : (isDark ? "#334155" : "#f1f5f9"),
                  color: currentPage === totalPages ? textSecondary : textPrimary,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "14px"
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
