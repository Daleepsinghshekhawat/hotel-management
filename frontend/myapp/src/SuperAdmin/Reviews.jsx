import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";
import useDebounce from "../hooks/useDebounce";
import { MessageSquare, Search, Star, Trash2 } from "lucide-react";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${URL}/api/reviews/getAllReviews`, { params: { search: debouncedSearch } });
      if (response.data.success) {
        setReviews(response.data.result || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [debouncedSearch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await axios.delete(`${URL}/api/reviews/deleteReview/${id}`);
      if (res.data.success) {
        alert("Review deleted successfully");
        fetchReviews();
      } else {
        alert("Failed to delete review");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting review");
    }
  };

  const filteredReviews = reviews;

  const renderStars = (rating) => {
    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={14} 
            fill={star <= rating ? "#f59e0b" : "transparent"} 
            color={star <= rating ? "#f59e0b" : "#cbd5e1"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "10px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "24px", color: "#0f172a", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={24} color="#3b82f6" />
            Guest Reviews
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Dashboard / Guest Reviews
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "24px", maxWidth: "400px" }}>
        <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
        <input
          type="text"
          placeholder="Search reviews by hotel, guest or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%", padding: "10px 10px 10px 38px", borderRadius: "8px",
            border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box",
            background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)", overflow: "hidden"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>Loading reviews...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={thStyle}>Guest</th>
                  <th style={thStyle}>Hotel</th>
                  <th style={thStyle}>Rating</th>
                  <th style={thStyle}>Review</th>
                  <th style={thStyle}>Date</th>
                  <th style={{...thStyle, textAlign: "center"}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length > 0 ? filteredReviews.map((review) => (
                  <tr key={review._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{review.user?.name || "Anonymous"}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{review.user?.email || "N/A"}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{review.hotel?.hotelName || "N/A"}</div>
                    </td>
                    <td style={tdStyle}>
                      {renderStars(review.rating)}
                    </td>
                    <td style={{...tdStyle, maxWidth: "300px"}}>
                      <div style={{ 
                        color: "#475569", 
                        fontSize: "13px",
                        lineHeight: "1.5",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }} title={review.reviewText}>
                        "{review.reviewText}"
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ color: "#475569", fontSize: "13px" }}>
                        {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}
                      </div>
                    </td>
                    <td style={{...tdStyle, textAlign: "center"}}>
                      <button 
                        onClick={() => handleDelete(review._id)}
                        title="Delete Review"
                        style={{
                          background: "transparent", border: "none", cursor: "pointer",
                          color: "#94a3b8", padding: "6px", borderRadius: "6px",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "#fef2f2"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

const thStyle = {
  padding: "16px", fontSize: "13px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px"
};

const tdStyle = {
  padding: "16px", fontSize: "14px", color: "#334155", verticalAlign: "top"
};
