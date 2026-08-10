import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "../api";
import { Download, MapPin, Calendar, Users, Moon, ArrowRight } from "lucide-react";

export default function UserActiveBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
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
        const res = await axios.get(`${URL}/api/getBookingsByGuest/${user.email}`, {
          params: { page, limit, status: 'active' }
        });
        const active = res.data.result || [];
        setBookings(active);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user.email, navigate, page, limit]);

  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";
  };

  const statusBadge = (status) => {
    const styles = {
      confirmed: { bg: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "#22c55e" },
      pending: { bg: "rgba(234, 179, 8, 0.15)", color: "#fde047", border: "#eab308" },
    };
    const s = styles[status] || { bg: "rgba(161, 161, 170, 0.15)", color: "#d4d4d8", border: "#a1a1aa" };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: "6px 14px",
          borderRadius: "100px",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
          border: `1px solid rgba(${parseInt(s.border.slice(1, 3), 16)}, ${parseInt(s.border.slice(3, 5), 16)}, ${parseInt(s.border.slice(5, 7), 16)}, 0.3)`,
          boxShadow: `0 0 10px rgba(${parseInt(s.border.slice(1, 3), 16)}, ${parseInt(s.border.slice(3, 5), 16)}, ${parseInt(s.border.slice(5, 7), 16)}, 0.2)`
        }}
      >
        {status || "Unknown"}
      </span>
    );
  };

  const handleDownloadReceipt = async (bookingId) => {
    try {
      const response = await axios.get(`${URL}/api/pdf/booking/${bookingId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading receipt", error);
      alert("Failed to generate PDF Receipt");
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Calendar color="#eab308" /> Active Bookings
      </h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <p style={{ color: "#a1a1aa", margin: 0, fontSize: "15px", fontWeight: 300 }}>
          Your upcoming and current hotel reservations.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ fontSize: "14px", color: "#a1a1aa", fontWeight: 600 }}>Items per page:</label>
          <select 
            value={limit} 
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            style={{
              padding: "8px 12px", borderRadius: "8px", border: "1px solid #1f1f22",
              background: "#0a0a0c", color: "#fff", outline: "none", cursor: "pointer"
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: "24px" }}>
          {[1, 2].map(i => (
            <div key={i} style={{
              height: "200px", borderRadius: "24px",
              background: "linear-gradient(90deg, #111 25%, #222 50%, #111 75%)",
              backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite"
            }} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "80px 20px", 
          background: "rgba(10, 10, 12, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "32px", 
          border: "1px solid rgba(234,179,8,0.2)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
        }}>
          <div style={{ width: "80px", height: "80px", background: "rgba(234, 179, 8, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Calendar size={40} color="#eab308" strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: "28px", fontWeight: 300, color: "#fff", margin: "0 0 16px", letterSpacing: "1px" }}>No Active Bookings</h3>
          <p style={{ color: "#a1a1aa", fontSize: "16px", marginBottom: "40px", fontWeight: 300 }}>You don't have any upcoming reservations.</p>
          <button 
            onClick={() => navigate("/user/hotels")}
            style={{
              padding: "16px 40px",
              borderRadius: "100px",
              border: "none",
              background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
              color: "#050505",
              fontWeight: 800,
              fontSize: "16px",
              cursor: "pointer",
              transition: "transform 0.3s, box-shadow 0.3s"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(234,179,8,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Explore Destinations
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "32px" }}>
          {bookings.map((b) => {
            const location = b.hotel?.location;
            const city = typeof location === "object"
              ? [location?.cityname, location?.state?.Statename].filter(Boolean).join(", ")
              : location || "Premium Location";

            return (
              <div key={b._id} style={{ 
                background: "#0a0a0c", 
                borderRadius: "24px", 
                padding: "24px", 
                border: "1px solid #1f1f22",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)", 
                display: "flex", 
                gap: "32px", 
                flexWrap: "wrap",
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.4s",
                cursor: "default"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "rgba(234, 179, 8, 0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#1f1f22";
              }}
              >
                <div style={{ width: "200px", height: "200px", borderRadius: "16px", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                  {b.hotel?.image || b.hotel?.images?.[0] ? (
                    <img src={b.hotel.image || b.hotel.images[0]} alt="Hotel" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Moon size={40} color="#333" />
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: "250px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                      <h3 style={{ fontSize: "24px", fontWeight: 300, color: "#fff", margin: "0 0 8px", letterSpacing: "0.5px" }}>{b.hotel?.hotelName || "Exclusive Property"}</h3>
                      <div style={{ color: "#a1a1aa", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 300 }}>
                        <MapPin size={14} color="#eab308" /> {city}
                      </div>
                      <div style={{ color: "#eab308", fontSize: "14px", marginTop: "8px", fontWeight: 500, letterSpacing: "1px", textTransform: "uppercase" }}>
                        {b.room?.roomName} • {b.room?.roomType}
                      </div>
                    </div>
                    <div>{statusBadge(b.status)}</div>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "24px", marginTop: "24px", background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "1px" }}>Check-In</div>
                      <div style={{ fontWeight: 300, color: "#fff", fontSize: "16px" }}>{formatDate(b.checkIn)}</div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ArrowRight size={24} color="#333" />
                    </div>

                    <div>
                      <div style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "1px" }}>Check-Out</div>
                      <div style={{ fontWeight: 300, color: "#fff", fontSize: "16px" }}>{formatDate(b.checkOut)}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "1px" }}>Party</div>
                      <div style={{ fontWeight: 300, color: "#fff", fontSize: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Users size={16} /> {b.guests || 1} • <Moon size={16} /> {b.nights || 0}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: "right", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "24px" }}>
                      <div style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "1px" }}>Total Amount</div>
                      <div style={{ fontWeight: 700, color: "#eab308", fontSize: "24px" }}>₹{(b.totalAmount || 0).toLocaleString("en-IN")}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "16px", marginTop: "16px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <button
                      onClick={() => handleDownloadReceipt(b._id)}
                      style={{
                        padding: "10px 24px", borderRadius: "100px", background: "rgba(16, 185, 129, 0.1)", color: "#34d399",
                        border: "1px solid rgba(16, 185, 129, 0.3)", fontWeight: 600, fontSize: "14px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)"; }}
                    >
                      <Download size={18} /> Receipt
                    </button>
                    <button
                      onClick={() => navigate(`/user/hotel/${b.hotel?._id}`)}
                      style={{
                        padding: "10px 24px", borderRadius: "100px", background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)", color: "#050505",
                        border: "none", fontWeight: 800, fontSize: "14px", cursor: "pointer", transition: "all 0.2s",
                        boxShadow: "0 4px 15px rgba(234, 179, 8, 0.3)"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      View Hotel
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "16px", background: "#0a0a0c", borderRadius: "12px", border: "1px solid #1f1f22" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "10px 20px", borderRadius: "8px", border: "1px solid #1f1f22",
                  background: page === 1 ? "#111" : "#0a0a0c", color: page === 1 ? "#333" : "#fff",
                  fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer"
                }}
              >
                Previous
              </button>

              <span style={{ fontSize: "14px", fontWeight: 600, color: "#a1a1aa" }}>
                Page <span style={{ color: "#eab308" }}>{page}</span> of {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                style={{
                  padding: "10px 20px", borderRadius: "8px", border: "1px solid #1f1f22",
                  background: page === totalPages || totalPages === 0 ? "#111" : "#0a0a0c", color: page === totalPages || totalPages === 0 ? "#333" : "#fff",
                  fontWeight: 600, cursor: page === totalPages || totalPages === 0 ? "not-allowed" : "pointer"
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
