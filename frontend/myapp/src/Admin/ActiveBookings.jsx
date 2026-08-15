import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";
import useDebounce from "../hooks/useDebounce";
import useTheme from "../useTheme";

export default function ActiveBookings() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/getAllBookings`, {
        params: { search: debouncedSearch }
      });
      // Filter for active bookings only
      const active = (res.data.result || []).filter(b => 
        b.status === "confirmed" || b.status === "pending"
      );
      setBookings(active);
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [debouncedSearch]);

  const handleCheckout = async (bookingId) => {
    if (!window.confirm("Are you sure you want to checkout/unbook this reservation?")) return;
    try {
      setLoading(true);
      await axios.patch(`${URL}/api/checkoutBooking/${bookingId}`);
      await fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to checkout booking.");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";
  };

  const statusBadge = (status) => {
    const styles = {
      confirmed: { bg: "#dcfce7", color: "#15803d" },
      pending: { bg: "#fef3c7", color: "#d97706" },
    };
    const s = styles[status] || { bg: "#f1f5f9", color: "#64748b" };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "capitalize",
        }}
      >
      </span>
    );
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          🛎️ Active Bookings
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Current and upcoming room reservations across all hotels.
        </p>
      </div>

      {bookings.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderRadius: "12px", padding: "20px", border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Active Bookings</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#1e40af", marginTop: "4px" }}>{bookings.length}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderRadius: "12px", padding: "20px", border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Confirmed</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#15803d", marginTop: "4px" }}>{bookings.filter((b) => b.status === "confirmed").length}</div>
          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="Search by hotel, room, or guest name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 16px",
          borderRadius: "10px",
          border: isDark ? "1px solid #cbd5e1" : "1px solid #334155",
          marginBottom: "24px",
          boxSizing: "border-box",
          fontSize: "14px",
          outline: "none",
          background: isDark ? "#f8fafc" : "#0f172a",
          color: isDark ? "#000000" : "#ffffff"
        }}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: isDark ? "#64748b" : "#94a3b8" }}>Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: isDark ? "#94a3b8" : "#64748b",
            background: isDark ? "#f8fafc" : "#1e293b",
            borderRadius: "16px",
            border: isDark ? "1px dashed #cbd5e1" : "1px dashed #334155",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "14px" }}>📅</div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: "16px" }}>No active bookings found.</p>
        </div>
      ) : (
        <div
          style={{
            background: isDark ? "#fff" : "#1e293b",
            borderRadius: "12px",
            border: isDark ? "1px solid #e2e8f0" : "1px solid #334155",
            overflowX: "auto",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: isDark ? "#f8fafc" : "#334155", borderBottom: isDark ? "1px solid #e2e8f0" : "1px solid #475569" }}>
                <th style={{ padding: "16px", fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8" }}>ID</th>
                <th style={{ padding: "16px", fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8" }}>Hotel</th>
                <th style={{ padding: "16px", fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8" }}>Room</th>
                <th style={{ padding: "16px", fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8" }}>Guest</th>
                <th style={{ padding: "16px", fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8", whiteSpace: "nowrap" }}>Check-in</th>
                <th style={{ padding: "16px", fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8", whiteSpace: "nowrap" }}>Check-out</th>
                <th style={{ padding: "16px", fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8" }}>Total</th>
                <th style={{ padding: "16px", fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8", textAlign: "center" }}>Status</th>
                <th style={{ padding: "16px", fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} style={{ borderBottom: isDark ? "1px solid #f1f5f9" : "1px solid #334155" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 500, color: isDark ? "#3b82f6" : "#60a5fa" }}>#{b._id.slice(-6).toUpperCase()}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: isDark ? "#1e293b" : "#f8fafc" }}>{b.hotel?.hotelName || "N/A"}</td>
                  <td style={{ padding: "14px 16px", color: isDark ? "#475569" : "#cbd5e1" }}>
                    <div>{b.room?.roomName || "N/A"}</div>
                    <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>{b.room?.roomType || ""}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: isDark ? "#475569" : "#cbd5e1" }}>
                    <div style={{ fontWeight: 600, color: isDark ? "#1e293b" : "#f8fafc" }}>{b.guestName || "N/A"}</div>
                    <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>{b.guestEmail || ""}</div>
                    <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>{b.guestPhone || ""}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: isDark ? "#475569" : "#cbd5e1", whiteSpace: "nowrap" }}>{formatDate(b.checkIn)}</td>
                  <td style={{ padding: "14px 16px", color: isDark ? "#475569" : "#cbd5e1", whiteSpace: "nowrap" }}>{formatDate(b.checkOut)}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: isDark ? "#0f172a" : "#f8fafc", fontFamily: "monospace" }}>₹{(b.adminEarnings != null ? b.adminEarnings : (b.totalAmount || 0)).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>{statusBadge(b.status)}</td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => handleCheckout(b._id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          fontWeight: 600,
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        Unbook
                      </button>
                    )}
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
