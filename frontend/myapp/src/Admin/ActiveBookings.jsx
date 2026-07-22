import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";

export default function ActiveBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/getAllBookings`);
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
  }, []);

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
        {status || "Unknown"}
      </span>
    );
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      (b.guestName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.guestEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.hotel?.hotelName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.room?.roomName || "").toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

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

      <div style={{ marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="🔍 Search by guest, hotel, or room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: "400px", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>⏳ Loading active bookings...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 40px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛎️</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>No Active Bookings</h3>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>There are no upcoming or current reservations.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Hotel</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Room</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Guest</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Check-In</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Check-Out</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Amount</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600, textAlign: "center" }}>Status</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600, textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1e293b" }}>{b.hotel?.hotelName || "N/A"}</td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    <div>{b.room?.roomName || "N/A"}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{b.room?.roomType || ""}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{b.guestName || "N/A"}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{b.guestEmail || ""}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{b.guestPhone || ""}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569", whiteSpace: "nowrap" }}>{formatDate(b.checkIn)}</td>
                  <td style={{ padding: "14px 16px", color: "#475569", whiteSpace: "nowrap" }}>{formatDate(b.checkOut)}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>₹{(b.totalAmount || 0).toLocaleString("en-IN")}</td>
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
