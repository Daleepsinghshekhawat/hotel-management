import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "../api";

export default function UserBookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  
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
          params: { page, limit, status: 'history' }
        });
        const history = res.data.result || [];
        setBookings(history);
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
      ? new Date(dateString).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";
  };

  const statusBadge = (status) => {
    const styles = {
      completed: { bg: "#e0f2fe", color: "#0369a1" },
      cancelled: { bg: "#fee2e2", color: "#dc2626" },
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSubmittingReview(true);
    try {
      await axios.post(`${URL}/api/reviews/addReview`, {
        hotelId: selectedBooking.hotel?._id,
        bookingId: selectedBooking._id,
        userId: user._id,
        rating,
        reviewText,
      });
      // Mark as reviewed locally
      setBookings((prev) =>
        prev.map((b) => (b._id === selectedBooking._id ? { ...b, isReviewed: true } : b))
      );
      setReviewModalOpen(false);
      setReviewText("");
      setRating(5);
      alert("Review submitted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>
        📋 Booking History
      </h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>
          Your past stays and cancelled reservations.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ fontSize: "14px", color: "#475569", fontWeight: 600 }}>Items per page:</label>
          <select 
            value={limit} 
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            style={{
              padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1",
              background: "#fff", color: "#0f172a", outline: "none", cursor: "pointer"
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          ⏳ Loading your booking history...
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>No History Found</h3>
          <p style={{ color: "#64748b", fontSize: "15px", marginBottom: "24px" }}>You have no past or cancelled bookings.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {bookings.map((b) => (
            <div key={b._id} style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", display: "flex", gap: "24px", flexWrap: "wrap", opacity: b.status === "cancelled" ? 0.7 : 1 }}>
              <div style={{ width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, background: "#f1f5f9" }}>
                {b.hotel?.image ? (
                  <img src={b.hotel.images?.[0]} alt="Hotel" style={{ width: "100%", height: "100%", objectFit: "cover", filter: b.status === "cancelled" ? "grayscale(100%)" : "none" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>🏨</div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: "250px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px", textDecoration: b.status === "cancelled" ? "line-through" : "none" }}>{b.hotel?.hotelName || "Hotel"}</h3>
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
                  <div style={{ display: "flex", gap: "16px", marginLeft: "auto", textAlign: "right", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Total Amount</div>
                      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "20px" }}>₹{(b.totalAmount || 0).toLocaleString("en-IN")}</div>
                    </div>
                    <button
                      onClick={() => navigate(`/user/hotel/${b.hotel?._id}`)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        background: "#6366f1",
                        color: "#fff",
                        border: "none",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: "pointer"
                      }}
                    >
                      View Hotel
                    </button>
                    {b.status === "completed" && !b.isReviewed && (
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setReviewModalOpen(true);
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          background: "#10b981",
                          color: "#fff",
                          border: "none",
                          fontWeight: 600,
                          fontSize: "14px",
                          cursor: "pointer"
                        }}
                      >
                        ⭐ Write a Review
                      </button>
                    )}
                    {b.status === "completed" && b.isReviewed && (
                       <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 600 }}>
                         ✅ Reviewed
                       </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "16px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "10px 20px", borderRadius: "8px", border: "1px solid #cbd5e1",
                  background: page === 1 ? "#f1f5f9" : "#fff", color: page === 1 ? "#94a3b8" : "#0f172a",
                  fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer"
                }}
              >
                Previous
              </button>

              <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>
                Page <span style={{ color: "#2563eb" }}>{page}</span> of {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                style={{
                  padding: "10px 20px", borderRadius: "8px", border: "1px solid #cbd5e1",
                  background: page === totalPages || totalPages === 0 ? "#f1f5f9" : "#fff", color: page === totalPages || totalPages === 0 ? "#94a3b8" : "#0f172a",
                  fontWeight: 600, cursor: page === totalPages || totalPages === 0 ? "not-allowed" : "pointer"
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "32px", borderRadius: "16px", width: "90%", maxWidth: "500px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 16px", color: "#1e293b" }}>Write a Review</h3>
            <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
              How was your stay at {selectedBooking?.hotel?.hotelName}?
            </p>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "#334155" }}>Rating</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      onClick={() => setRating(star)}
                      style={{ fontSize: "24px", cursor: "pointer", color: star <= rating ? "#eab308" : "#cbd5e1" }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "#334155" }}>Your Review</label>
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                  rows="4"
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", fontFamily: "inherit" }}
                  placeholder="Share details of your own experience at this hotel"
                />
              </div>
              <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setReviewModalOpen(false)} style={{ padding: "10px 20px", background: "#f1f5f9", border: "none", borderRadius: "8px", fontWeight: 600, color: "#475569", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={submittingReview} style={{ padding: "10px 20px", background: "#6366f1", border: "none", borderRadius: "8px", fontWeight: 600, color: "#fff", cursor: submittingReview ? "not-allowed" : "pointer" }}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
