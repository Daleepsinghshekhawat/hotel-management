import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import URL from "../api";

function StatCard({ bg, color, icon, count, label, sub }) {
  return (
    <div
      style={{
        background: bg,
        borderRadius: "16px",
        padding: "20px 24px",
        border: `1px solid ${color}20`,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        display: "flex",
        alignItems: "center",
        gap: "18px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: color, lineHeight: 1 }}>
          {count}
        </div>
        <div style={{ fontSize: "14px", fontWeight: 700, color: color, marginTop: "4px" }}>
          {label}
        </div>
        <div style={{ fontSize: "11px", color: `${color}cc`, marginTop: "1px" }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    admins: 0,
    hotelOwners: 0,
    users: 0,
    liveHotels: 0,
    hotelRequestsTotal: 0,
    hotelRequestsPending: 0,
    adminRequestsTotal: 0,
    adminRequestsPending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const [usersRes, hotelsRes, hotelReqsRes, adminReqsRes] = await Promise.all([
          axios.get(`${URL}/api/getUsersByRole/all`),
          axios.get(`${URL}/api/getAllHotels`),
          axios.get(`${URL}/api/getAllHotelRequests`),
          axios.get(`${URL}/api/getAllAdminRequests`),
        ]);

        const allUsers = usersRes.data.result || [];
        const hotelRequests = hotelReqsRes.data.result || [];
        const adminRequests = adminReqsRes.data.result || [];

        setStats({
          admins: allUsers.filter((u) => u.role === "admin").length,
          hotelOwners: allUsers.filter((u) => u.role === "hotelOwner").length,
          users: allUsers.filter((u) => u.role === "user").length,
          liveHotels: (hotelsRes.data.result || []).length,
          hotelRequestsTotal: hotelRequests.length,
          hotelRequestsPending: hotelRequests.filter((r) => r.status === "pending").length,
          adminRequestsTotal: adminRequests.length,
          adminRequestsPending: adminRequests.filter((r) => r.status === "pending").length,
        });
      } catch (err) {
        console.error("Error fetching superadmin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Premium Banner Header */}
      <div
        style={{
          position: "relative",
          backgroundImage: "url('/superadmin_banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "16px",
          padding: "48px 32px",
          color: "#ffffff",
          marginBottom: "32px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
          overflow: "hidden",
        }}
      >
        {/* Dark overlay for readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 100%)",
            borderRadius: "16px",
            zIndex: 1,
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }}>
          <span
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(4px)",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#e2e8f0",
            }}
          >
            🛡️ Super Admin Control Center
          </span>
          <h1 style={{ margin: "16px 0 8px", fontSize: "32px", fontWeight: 800 }}>
            Platform Overview
          </h1>
          <p style={{ margin: 0, color: "#cbd5e1", fontSize: "15px", maxWidth: "600px" }}>
            Monitor and manage registered user accounts, administrative requests, and active hotel listings globally.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          ⏳ Gathering dashboard statistics...
        </div>
      ) : (
        <>
          {/* Main User Statistics */}
          <h3 style={{ fontSize: "18px", color: "#0f172a", margin: "0 0 16px", fontWeight: 700 }}>
            👥 User Accounts Metrics
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "36px" }}>
            <StatCard bg="#e0f2fe" color="#0369a1" icon="👤" count={stats.users} label="Regular Users" sub="Active platform clients" />
            <StatCard bg="#dcfce7" color="#166534" icon="🏨" count={stats.hotelOwners} label="Hotel Owners" sub="Managed listing owners" />
            <StatCard bg="#faf5ff" color="#6b21a8" icon="🛡️" count={stats.admins} label="Admins" sub="Regional platform moderators" />
            <StatCard bg="#ffe4e6" color="#be123c" icon="🏢" count={stats.liveHotels} label="Live Hotels" sub="Active hotel listings" />
          </div>

          {/* Request Action Channels */}
          <h3 style={{ fontSize: "18px", color: "#0f172a", margin: "0 0 16px", fontWeight: 700 }}>
            ⚡ Registration & Listings Verification
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {/* Hotel Requests Summary Card */}
            <div style={actionBlockStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "16px", color: "#1e293b", fontWeight: 700 }}>Hotel Listing Approvals</h4>
                <span style={badgeStyle(stats.hotelRequestsPending > 0 ? "#fef9c3" : "#dcfce7", stats.hotelRequestsPending > 0 ? "#854d0e" : "#166534")}>
                  {stats.hotelRequestsPending} Pending
                </span>
              </div>
              <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "14px", lineHeight: "1.5" }}>
                Total submissions: <strong>{stats.hotelRequestsTotal}</strong>. Manage pending applications, verify registration documents and verify hotel features.
              </p>
              <Link to="/superadmin/hotel-requests" style={buttonStyle("#2563eb")}>
                Review Hotel Listings →
              </Link>
            </div>

            {/* Admin Requests Summary Card */}
            <div style={actionBlockStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h4 style={{ margin: 0, fontSize: "16px", color: "#1e293b", fontWeight: 700 }}>Become Admin Requests</h4>
                <span style={badgeStyle(stats.adminRequestsPending > 0 ? "#fef9c3" : "#dcfce7", stats.adminRequestsPending > 0 ? "#854d0e" : "#166534")}>
                  {stats.adminRequestsPending} Pending
                </span>
              </div>
              <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "14px", lineHeight: "1.5" }}>
                Total requests: <strong>{stats.adminRequestsTotal}</strong>. Verify identity documents of regional moderators and promote accounts to administrators.
              </p>
              <Link to="/superadmin/admin-requests" style={buttonStyle("#4f46e5")}>
                Review Account Requests →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const actionBlockStyle = () => ({
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});

const badgeStyle = (bg, color) => ({
  background: bg,
  color: color,
  padding: "4px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
});

const buttonStyle = (bg) => ({
  display: "inline-block",
  textAlign: "center",
  textDecoration: "none",
  background: bg,
  color: "#ffffff",
  padding: "10px 16px",
  borderRadius: "8px",
  fontWeight: 600,
  fontSize: "13px",
  transition: "opacity 0.2s",
});
