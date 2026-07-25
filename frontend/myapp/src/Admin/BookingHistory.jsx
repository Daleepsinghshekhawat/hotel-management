import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "../api";

export default function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
    const matchesSearch =
      (b.guestName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.guestEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.hotel?.hotelName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.room?.roomName || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
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
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          📋 Booking History
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
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
              background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #bfdbfe",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Total Bookings
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#1e40af", marginTop: "4px" }}>
              {bookings.length}
            </div>
          </div>
          <div
            style={{
              background: "linear-gradient(135deg, #eff6ff, #e0f2fe)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #bae6fd",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Completed
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0369a1", marginTop: "4px" }}>
              {bookings.filter((b) => b.status === "completed").length}
            </div>
          </div>
          <div
            style={{
              background: "linear-gradient(135deg, #eff6ff, #e0f2fe)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #bae6fd",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Completed
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0369a1", marginTop: "4px" }}>
              {bookings.filter((b) => b.status === "completed").length}
            </div>
          </div>
          <div
            style={{
              background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #fecaca",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Cancelled
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#b91c1c", marginTop: "4px" }}>
              {bookings.filter((b) => b.status === "cancelled").length}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
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
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
            background: "#f8fafc",
            boxSizing: "border-box",
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
            background: "#f8fafc",
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
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          ⏳ Loading booking history...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 40px",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>
            No Bookings Found
          </h3>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
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
            border: "1px solid #e2e8f0",
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
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Hotel</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Room</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Guest</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Check-In</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Check-Out</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Nights</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Amount</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600, textAlign: "center" }}>Status</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600, textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1e293b" }}>
                    {b.hotel?.hotelName || "N/A"}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    <div>{b.room?.roomName || "N/A"}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {b.room?.roomType || ""}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{b.guestName || "N/A"}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{b.guestEmail || ""}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{b.guestPhone || ""}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569", whiteSpace: "nowrap" }}>
                    {formatDate(b.checkIn)}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569", whiteSpace: "nowrap" }}>
                    {formatDate(b.checkOut)}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569", textAlign: "center" }}>
                    {b.nights || "—"}
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                    ₹{(b.totalAmount || 0).toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    {statusBadge(b.status)}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <button
                      onClick={() => navigate(`/adminpage/room/${b.room?._id}`)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        background: "#3b82f6",
                        color: "#fff",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      View Room
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
    </div>
  );
}
