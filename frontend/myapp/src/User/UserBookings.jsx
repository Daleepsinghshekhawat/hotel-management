import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "../api";

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.email) {
      navigate("/login");
      return;
    }
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${URL}/api/getBookingsByGuest/${user.email}`);
        setBookings(res.data.result || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user.email, navigate]);

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
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "capitalize",
        }}
      >
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px", fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>
        My Bookings
      </h2>
      <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "15px" }}>
        Manage and view your hotel reservations.
      </p>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          ⏳ Loading your bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧳</div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>No Bookings Found</h3>
          <p style={{ color: "#64748b", fontSize: "15px", marginBottom: "24px" }}>You haven't made any hotel reservations yet.</p>
          <button 
            onClick={() => navigate("/user/hotels")}
            style={{ padding: "10px 24px", borderRadius: "8px", background: "#6366f1", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
          >
            Explore Hotels
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {bookings.map((b) => (
            <div key={b._id} style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div style={{ width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, background: "#f1f5f9" }}>
                {b.hotel?.image ? (
                  <img src={b.hotel.images?.[0]} alt="Hotel" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>🏨</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: "250px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>{b.hotel?.hotelName || "Hotel"}</h3>
                    <div style={{ color: "#64748b", fontSize: "14px" }}>{b.room?.roomName} • {b.room?.roomType}</div>
                  </div>
                  <div>{statusBadge(b.status)}</div>
                </div>
                
                <div style={{ display: "flex", gap: "32px", marginTop: "16px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Check-In</div>
                    <div style={{ fontWeight: 600, color: "#334155", fontSize: "15px" }}>{formatDate(b.checkIn)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Check-Out</div>
                    <div style={{ fontWeight: 600, color: "#334155", fontSize: "15px" }}>{formatDate(b.checkOut)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Guests & Nights</div>
                    <div style={{ fontWeight: 600, color: "#334155", fontSize: "15px" }}>{b.guests || 1} Guests • {b.nights || 0} Nights</div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Total Amount</div>
                    <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "20px" }}>₹{(b.totalAmount || 0).toLocaleString("en-IN")}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
