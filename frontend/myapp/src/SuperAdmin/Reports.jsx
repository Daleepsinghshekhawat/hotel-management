import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";
import { BarChart2, TrendingUp, Download, IndianRupee, Percent, CreditCard, Building2 } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [financials, setFinancials] = useState({
    totalRevenue: 0,
    totalTax: 0,
    totalDiscounts: 0,
    totalBookings: 0
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [topHotels, setTopHotels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${URL}/api/getAllBookings`);
        if (res.data.success) {
          processReportData(res.data.result || []);
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const processReportData = (bookings) => {
    // 1. Calculate Overall Financials (Exclude cancelled)
    const validBookings = bookings.filter(b => b.status !== "cancelled");
    
    let revenue = 0;
    let tax = 0;
    let discounts = 0;
    
    // 2. Aggregate Data by Month & Hotel
    const monthMap = {};
    const hotelMap = {};

    validBookings.forEach(b => {
      // Totals
      revenue += b.totalAmount || 0;
      tax += b.taxAmount || 0;
      discounts += b.discountAmount || 0;

      // Monthly Trend (Last 6 Months logic approximation)
      const d = new Date(b.createdAt);
      const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { name: monthKey, Revenue: 0, Bookings: 0 };
      }
      monthMap[monthKey].Revenue += (b.totalAmount || 0);
      monthMap[monthKey].Bookings += 1;

      // Hotel Performance
      const hotelId = b.hotel?._id || "unknown";
      const hotelName = b.hotel?.hotelName || "Unknown Hotel";
      if (!hotelMap[hotelId]) {
        hotelMap[hotelId] = { name: hotelName, revenue: 0, bookings: 0 };
      }
      hotelMap[hotelId].revenue += (b.totalAmount || 0);
      hotelMap[hotelId].bookings += 1;
    });

    setFinancials({
      totalRevenue: revenue,
      totalTax: tax,
      totalDiscounts: discounts,
      totalBookings: validBookings.length
    });

    // Format Monthly Data (Sort chronologically if possible, or just keep as is)
    // For simplicity, we just take the values in the order they appear (could be improved with strict date sorting)
    const mData = Object.values(monthMap).slice(-6); // Just take last 6 active months
    setMonthlyData(mData);

    // Format Top Hotels
    const hData = Object.values(hotelMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    setTopHotels(hData);
  };

  const handleExport = () => {
    alert("Exporting financial report as PDF/CSV...");
  };

  if (loading) {
    return <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading report data...</div>;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "10px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "24px", color: "#0f172a", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChart2 size={24} color="#3b82f6" />
            Financial Reports
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Dashboard / Analytics & Reports
          </p>
        </div>
        <button 
          onClick={handleExport}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#ffffff", border: "1px solid #e2e8f0", color: "#334155",
            padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
            cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}
        >
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        
        <div style={kpiCardStyle}>
          <div style={kpiIconWrapper("#dcfce7", "#16a34a")}><IndianRupee size={20} /></div>
          <div>
            <div style={kpiLabelStyle}>Total Revenue</div>
            <div style={kpiValueStyle}>₹{financials.totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={kpiIconWrapper("#fef9c3", "#ca8a04")}><CreditCard size={20} /></div>
          <div>
            <div style={kpiLabelStyle}>Total Bookings</div>
            <div style={kpiValueStyle}>{financials.totalBookings.toLocaleString()}</div>
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={kpiIconWrapper("#fee2e2", "#dc2626")}><Percent size={20} /></div>
          <div>
            <div style={kpiLabelStyle}>Discounts Given</div>
            <div style={kpiValueStyle}>₹{financials.totalDiscounts.toLocaleString()}</div>
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={kpiIconWrapper("#e0e7ff", "#4f46e5")}><TrendingUp size={20} /></div>
          <div>
            <div style={kpiLabelStyle}>Tax Collected</div>
            <div style={kpiValueStyle}>₹{financials.totalTax.toLocaleString()}</div>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        
        {/* Revenue Trend Area Chart */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 24px", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>Revenue Trend (Recent Months)</h3>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dx={-10} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Hotels Bar Chart */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
          <h3 style={{ margin: "0 0 24px", fontSize: "16px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
            <Building2 size={18} color="#10b981" /> Top Performing Hotels
          </h3>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <BarChart data={topHotels} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#475569" }} width={80} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

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
