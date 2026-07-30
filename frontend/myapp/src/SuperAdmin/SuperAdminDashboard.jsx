import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import URL from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Building2, Users, Receipt, TrendingUp, TrendingDown } from "lucide-react";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // Confirmed (Green), Pending (Yellow), Cancelled (Red)

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
    topHotels: [],
    bookingStatus: [],
    chartData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const [usersRes, hotelsRes, bookingsRes] = await Promise.all([
          axios.get(`${URL}/api/getUsersByRole/all`),
          axios.get(`${URL}/api/getAllHotels`),
          axios.get(`${URL}/api/getAllBookings`),
        ]);

        const allUsers = usersRes.data.result || [];
        const allHotels = hotelsRes.data.result || [];
        const allBookings = bookingsRes.data.result || [];

        // 1. Calculate basic totals
        let totalRev = 0;
        let confirmedCount = 0;
        let pendingCount = 0;
        let cancelledCount = 0;

        allBookings.forEach((b) => {
          if (["confirmed", "completed", "checked_in"].includes(b.status)) {
             totalRev += b.totalAmount || 0;
          }
          if (["confirmed", "completed", "checked_in"].includes(b.status)) confirmedCount++;
          else if (b.status === "pending") pendingCount++;
          else cancelledCount++;
        });

        // 2. Booking Status Data
        const bookingStatusData = [
          { name: "Confirmed", value: confirmedCount },
          { name: "Pending", value: pendingCount },
          { name: "Cancelled", value: cancelledCount },
        ];

        // 3. Top Hotels (by Revenue)
        const hotelRevenueMap = {};
        allBookings.forEach((b) => {
          if (!b.hotel) return;
          const hId = b.hotel._id || b.hotel;
          if (!hotelRevenueMap[hId]) {
            hotelRevenueMap[hId] = {
               id: hId,
               name: b.hotel.hotelName || "Unknown Hotel",
               revenue: 0,
               bookings: 0
            };
          }
          if (["confirmed", "completed", "checked_in"].includes(b.status)) {
             hotelRevenueMap[hId].revenue += (b.totalAmount || 0);
          }
          hotelRevenueMap[hId].bookings += 1;
        });
        const topHotels = Object.values(hotelRevenueMap)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // 4. Chart Data (Group by Day - Last 10 days for illustration)
        // For a real dashboard, we'd process actual dates. 
        // Here we build a robust daily map for the last 15 days from today
        const chartDataMap = {};
        for(let i=14; i>=0; i--) {
           const d = new Date();
           d.setDate(d.getDate() - i);
           const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); // e.g. 01 May
           chartDataMap[dateStr] = { name: dateStr, bookings: 0, revenue: 0 };
        }

        allBookings.forEach(b => {
           if(!b.createdAt) return;
           const d = new Date(b.createdAt);
           const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
           if (chartDataMap[dateStr]) {
              chartDataMap[dateStr].bookings += 1;
              if (["confirmed", "completed", "checked_in"].includes(b.status)) {
                chartDataMap[dateStr].revenue += (b.totalAmount || 0);
              }
           }
        });
        const finalChartData = Object.values(chartDataMap);

        // 5. Recent Bookings
        const recent = [...allBookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

        setStats({
          totalUsers: allUsers.length,
          totalHotels: allHotels.length,
          totalBookings: allBookings.length,
          totalRevenue: totalRev,
          recentBookings: recent,
          topHotels: topHotels,
          bookingStatus: bookingStatusData,
          chartData: finalChartData
        });

      } catch (err) {
        console.error("Error fetching superadmin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", color: "#94a3b8" }}>Loading Dashboard Data...</div>;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc", padding: "10px", minHeight: "100vh" }}>
      
      {/* 4 TOP STATS CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "24px" }}>
        
        <StatCard title="Total Bookings" value={stats.totalBookings.toLocaleString()} icon={<Receipt size={20} color="#3b82f6"/>} trend="+12.5%" />
        <StatCard title="Total Hotels" value={stats.totalHotels.toLocaleString()} icon={<Building2 size={20} color="#10b981"/>} trend="+8.4%" />
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={<Users size={20} color="#8b5cf6"/>} trend="+18.2%" />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<Receipt size={20} color="#f59e0b"/>} trend="+22.7%" />

      </div>

      {/* CHARTS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        {/* Bookings Overview Chart */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
             <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#1e293b" }}>Bookings Overview</h3>
             <select style={selectStyle}><option>Daily</option></select>
          </div>
          <div style={{ height: "250px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Overview Chart */}
        <div style={cardStyle}>
           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
             <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#1e293b" }}>Revenue Overview</h3>
             <select style={selectStyle}><option>Daily</option></select>
          </div>
          <div style={{ height: "250px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData} margin={{ top: 5, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Donut | Top Hotels | Recent Bookings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.5fr", gap: "20px" }}>
        
        {/* Booking Status Donut */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "15px", fontWeight: 600, color: "#1e293b" }}>Booking Status</h3>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px" }}>
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={stats.bookingStatus}
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {stats.bookingStatus.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div style={{ position: "absolute", right: "20px", top: "100px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {stats.bookingStatus.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: COLORS[i] }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                       <span style={{ fontWeight: 600, color: "#1e293b" }}>{s.name}</span>
                       <span>{s.value} ({stats.totalBookings > 0 ? ((s.value/stats.totalBookings)*100).toFixed(1) : 0}%)</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Top Hotels List */}
        <div style={cardStyle}>
           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
             <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#1e293b" }}>Top Hotels</h3>
             <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600, cursor: "pointer" }}>View All</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
             {stats.topHotels.map((h, i) => (
               <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                     <div style={{ width: "40px", height: "30px", background: "#e2e8f0", borderRadius: "6px" }} />
                     <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{h.name}</span>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>{h.bookings} Bookings</span>
                     </div>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>₹{h.revenue.toLocaleString()}</span>
               </div>
             ))}
             {stats.topHotels.length === 0 && <div style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>No data yet</div>}
          </div>
        </div>

        {/* Recent Bookings */}
        <div style={cardStyle}>
           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
             <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#1e293b" }}>Recent Bookings</h3>
             <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600, cursor: "pointer" }}>View All</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
             {stats.recentBookings.map((b, i) => (
               <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", width: "60px" }}>#{b.bookingId?.substring(0, 7) || "BK123"}</div>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingLeft: "10px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{b.hotel?.hotelName || "Unknown"}</span>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>{b.guests} Guests • {b.nights} Nights</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>₹{b.totalAmount?.toLocaleString() || 0}</span>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                           {new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}
                        </span>
                  </div>
               </div>
             ))}
             {stats.recentBookings.length === 0 && <div style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>No bookings yet</div>}
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponents & Styles

function StatCard({ title, value, icon, trend }) {
  const isUp = trend.startsWith("+");
  return (
    <div style={cardStyle}>
       <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
          <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>{title}</span>
       </div>
       <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
          {value}
       </div>
       <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
          <span style={{ color: isUp ? "#10b981" : "#ef4444", fontWeight: 600, display: "flex", alignItems: "center", gap: "2px" }}>
            {isUp ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {trend}
          </span>
          <span style={{ color: "#94a3b8" }}>From last month</span>
       </div>
    </div>
  );
}

const cardStyle = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
  border: "1px solid #f1f5f9",
  position: "relative"
};

const selectStyle = {
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  borderRadius: "6px",
  padding: "4px 8px",
  fontSize: "12px",
  color: "#64748b",
  outline: "none",
  cursor: "pointer"
};
