import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "../api";
import useDebounce from "../hooks/useDebounce";
import useTheme from "../useTheme";

export default function BookingHistory() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [contactModal, setContactModal] = useState(null);
  const [copied, setCopied] = useState("");

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/getAllBookings`);
      // Filter for past bookings only
      const history = (res.data.result || []).filter(b => 
        b.status === "completed" || b.status === "cancelled"
      );
      setBookings(history);
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
      completed: { bg: "#e0f2fe", color: "#0369a1" },
      cancelled: { bg: "#fee2e2", color: "#dc2626" },
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
    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;

    let matchesSearch = true;
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      matchesSearch = (
        (b.guestName && b.guestName.toLowerCase().includes(term)) ||
        (b.guestEmail && b.guestEmail.toLowerCase().includes(term)) ||
        (b.hotel?.hotelName && b.hotel.hotelName.toLowerCase().includes(term)) ||
        (b.room?.roomName && b.room.roomName.toLowerCase().includes(term))
      );
    }

    return matchesStatus && matchesSearch;
  });

  // Group bookings by hotel for summary stats
  const hotelStats = {};
  bookings.forEach((b) => {
    const name = b.hotel?.hotelName || "Unknown Hotel";
    if (!hotelStats[name]) {
      hotelStats[name] = { total: 0, revenue: 0 };
    }
    hotelStats[name].total += 1;
    if (b.status === "confirmed" || b.status === "completed") {
      hotelStats[name].revenue += b.totalAmount || 0;
    }
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: isDark ? "#0f172a" : "#f8fafc", fontWeight: 700 }}>
          📋 Booking History
        </h2>
        <p style={{ margin: 0, color: isDark ? "#64748b" : "#94a3b8", fontSize: "14px" }}>
          Past booking records across all hotels — completed stays and cancelled reservations.
        </p>
      </div>

      {/* Summary Cards */}
      {bookings.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: isDark ? "linear-gradient(135deg, #eff6ff, #dbeafe)" : "#1e293b",
              borderRadius: "12px",
              padding: "20px",
              border: isDark ? "1px solid #bfdbfe" : "1px solid #334155",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: isDark ? "#3b82f6" : "#60a5fa", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Bookings
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: isDark ? "#1e40af" : "#f8fafc", marginTop: "4px" }}>
              {bookings.length}
            </div>
          </div>
          <div
            style={{
              background: isDark ? "linear-gradient(135deg, #eff6ff, #e0f2fe)" : "#1e293b",
              borderRadius: "12px",
              padding: "20px",
              border: isDark ? "1px solid #bae6fd" : "1px solid #334155",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: isDark ? "#0284c7" : "#38bdf8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Completed
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: isDark ? "#0369a1" : "#f8fafc", marginTop: "4px" }}>
              {bookings.filter((b) => b.status === "completed").length}
            </div>
          </div>
          <div
            style={{
              background: isDark ? "linear-gradient(135deg, #fef2f2, #fee2e2)" : "#1e293b",
              borderRadius: "12px",
              padding: "20px",
              border: isDark ? "1px solid #fecaca" : "1px solid #334155",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: isDark ? "#dc2626" : "#fb7185", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Cancelled
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: isDark ? "#b91c1c" : "#f8fafc", marginTop: "4px" }}>
              {bookings.filter((b) => b.status === "cancelled").length}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍 Search by guest, hotel, or room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: "250px",
            padding: "12px 16px",
            borderRadius: "10px",
            border: isDark ? "1px solid #cbd5e1" : "1px solid #334155",
            fontSize: "14px",
            outline: "none",
            background: isDark ? "#f8fafc" : "#0f172a",
            color: isDark ? "#000000" : "#ffffff",
            boxSizing: "border-box",
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            border: isDark ? "1px solid #cbd5e1" : "1px solid #334155",
            fontSize: "14px",
            outline: "none",
            background: isDark ? "#f8fafc" : "#0f172a",
            color: isDark ? "#000000" : "#ffffff",
            cursor: "pointer",
            minWidth: "160px",
          }}
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: isDark ? "#64748b" : "#94a3b8" }}>
          ⏳ Loading booking history...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 40px",
            background: isDark ? "#ffffff" : "#1e293b",
            borderRadius: "16px",
            border: isDark ? "1px solid #e2e8f0" : "1px solid #334155",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: isDark ? "#1e293b" : "#f8fafc", margin: "0 0 8px" }}>
            No Bookings Found
          </h3>
          <p style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: "14px", margin: 0 }}>
            {search || statusFilter !== "all"
              ? "No bookings match your current search or filter."
              : "There are no booking records yet. Bookings will appear here when guests make reservations."}
          </p>
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            borderRadius: "12px",
            border: isDark ? "1px solid #e2e8f0" : "1px solid #334155",
            background: isDark ? "#fff" : "#1e293b",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: isDark ? "#f8fafc" : "#334155", borderBottom: isDark ? "2px solid #e2e8f0" : "2px solid #475569" }}>
                <th style={{ padding: "14px 16px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600 }}>Hotel</th>
                <th style={{ padding: "14px 16px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600 }}>Room</th>
                <th style={{ padding: "14px 16px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600 }}>Guest</th>
                <th style={{ padding: "14px 16px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600 }}>Check-In</th>
                <th style={{ padding: "14px 16px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600 }}>Check-Out</th>
                <th style={{ padding: "14px 16px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600 }}>Nights</th>
                <th style={{ padding: "14px 16px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600 }}>Amount</th>
                <th style={{ padding: "14px 16px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600, textAlign: "center" }}>Status</th>
                <th style={{ padding: "14px 16px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600, textAlign: "center" }}>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id} style={{ borderBottom: isDark ? "1px solid #f1f5f9" : "1px solid #334155" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: isDark ? "#1e293b" : "#f8fafc" }}>
                    {b.hotel?.hotelName || "N/A"}
                  </td>
                  <td style={{ padding: "14px 16px", color: isDark ? "#475569" : "#cbd5e1" }}>
                    <div>{b.room?.roomName || "N/A"}</div>
                    <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>
                      {b.room?.roomType || ""}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: isDark ? "#475569" : "#cbd5e1" }}>
                    <div style={{ fontWeight: 600, color: isDark ? "#1e293b" : "#f8fafc" }}>{b.guestName || "N/A"}</div>
                    <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>{b.guestEmail || ""}</div>
                    <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b" }}>{b.guestPhone || ""}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: isDark ? "#475569" : "#cbd5e1", whiteSpace: "nowrap" }}>
                    {formatDate(b.checkIn)}
                  </td>
                  <td style={{ padding: "14px 16px", color: isDark ? "#475569" : "#cbd5e1", whiteSpace: "nowrap" }}>
                    {formatDate(b.checkOut)}
                  </td>
                  <td style={{ padding: "14px 16px", color: isDark ? "#475569" : "#cbd5e1", textAlign: "center" }}>
                    {b.nights || "—"}
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: isDark ? "#0f172a" : "#f8fafc", fontFamily: "monospace" }}>
                    ₹{(b.totalAmount || 0).toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    {statusBadge(b.status)}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <button
                      onClick={() => setContactModal(b)}
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        background: "#3b82f6",
                        color: "#fff",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      ✉️ Contact
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hotel-wise Summary */}
      {Object.keys(hotelStats).length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", marginBottom: "16px" }}>
            🏨 Hotel-wise Summary
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "14px",
            }}
          >
            {Object.entries(hotelStats).map(([name, stats]) => (
              <div
                key={name}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>{name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    {stats.total} booking{stats.total !== 1 ? "s" : ""}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "16px",
                    color: "#15803d",
                    fontFamily: "monospace",
                  }}
                >
                  ₹{stats.revenue.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: isDark ? "#1e293b" : "#fff", width: "100%", maxWidth: "400px", borderRadius: "16px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: isDark ? "#f8fafc" : "#0f172a", fontWeight: 700 }}>Contact Guest</h3>
              <button onClick={() => setContactModal(null)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "18px", color: isDark ? "#94a3b8" : "#64748b" }}>✖</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Guest Name</label>
                <div style={{ padding: "10px 14px", background: isDark ? "#0f172a" : "#f1f5f9", borderRadius: "8px", color: isDark ? "#f8fafc" : "#1e293b", fontWeight: 600, fontSize: "14px" }}>
                  {contactModal.guestName || "N/A"}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Email Address</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1, padding: "10px 14px", background: isDark ? "#0f172a" : "#f1f5f9", borderRadius: "8px", color: isDark ? "#f8fafc" : "#1e293b", fontSize: "14px" }}>
                    {contactModal.guestEmail || "N/A"}
                  </div>
                  {contactModal.guestEmail && (
                    <button onClick={() => handleCopy(contactModal.guestEmail, "email")} style={{ padding: "0 14px", background: isDark ? "#334155" : "#e2e8f0", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>
                      {copied === "email" ? "✅" : "📋"}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Phone Number</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1, padding: "10px 14px", background: isDark ? "#0f172a" : "#f1f5f9", borderRadius: "8px", color: isDark ? "#f8fafc" : "#1e293b", fontSize: "14px" }}>
                    {contactModal.guestPhone || "N/A"}
                  </div>
                  {contactModal.guestPhone && (
                    <button onClick={() => handleCopy(contactModal.guestPhone, "phone")} style={{ padding: "0 14px", background: isDark ? "#334155" : "#e2e8f0", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>
                      {copied === "phone" ? "✅" : "📋"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {contactModal.guestEmail && (
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <a 
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactModal.guestEmail}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, display: "block", textAlign: "center", padding: "12px", background: "#ea4335", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", textDecoration: "none", boxSizing: "border-box" }}
                >
                  Compose in Gmail
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
