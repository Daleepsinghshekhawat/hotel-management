import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";
import { Tags, Search, CheckCircle, XCircle } from "lucide-react";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${URL}/api/getCoupons`);
      if (response.data.success) {
        setCoupons(response.data.coupons || []);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    if (!window.confirm(`Are you sure you want to mark this coupon as ${newStatus}?`)) return;

    try {
      const res = await axios.patch(`${URL}/api/changeCouponStatus/${id}`, { status: newStatus });
      if (res.data.success) {
        alert("Coupon status updated successfully");
        fetchCoupons();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.couponCode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.hotel?.hotelName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "10px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "24px", color: "#0f172a", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Tags size={24} color="#3b82f6" />
            Offers & Coupons
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Dashboard / Offers & Coupons
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "24px", maxWidth: "400px" }}>
        <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
        <input
          type="text"
          placeholder="Search by coupon code or hotel name..."
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
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>Loading coupons...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={thStyle}>Code</th>
                  <th style={thStyle}>Hotel</th>
                  <th style={thStyle}>Discount</th>
                  <th style={thStyle}>Min Booking</th>
                  <th style={thStyle}>Usage</th>
                  <th style={thStyle}>Expiry</th>
                  <th style={thStyle}>Status</th>
                  <th style={{...thStyle, textAlign: "center"}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length > 0 ? filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={tdStyle}>
                      <span style={{ 
                        fontWeight: 700, color: "#1e293b", background: "#f1f5f9", 
                        padding: "4px 8px", borderRadius: "6px", fontFamily: "monospace", letterSpacing: "1px"
                      }}>
                        {coupon.couponCode}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{coupon.hotel?.hotelName || "N/A"}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: "#10b981" }}>
                        {coupon.discountType === "percentage" ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                      </div>
                      {coupon.maximumDiscount > 0 && coupon.discountType === "percentage" && (
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Max ₹{coupon.maximumDiscount}</div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ color: "#475569" }}>₹{coupon.minimumBookingAmount}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ color: "#475569" }}>{coupon.usedCount} / {coupon.maxUsage}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ color: new Date(coupon.expiryDate) < new Date() ? "#dc2626" : "#475569" }}>
                        {new Date(coupon.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        background: coupon.status === "Active" ? "#dcfce7" : "#fee2e2",
                        color: coupon.status === "Active" ? "#166534" : "#991b1b",
                        padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600
                      }}>
                        {coupon.status}
                      </span>
                    </td>
                    <td style={{...tdStyle, textAlign: "center"}}>
                      <button 
                        onClick={() => handleStatusChange(coupon._id, coupon.status)}
                        style={{
                          background: "transparent", border: "1px solid #e2e8f0", cursor: "pointer",
                          color: coupon.status === "Active" ? "#dc2626" : "#10b981", 
                          padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        {coupon.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No coupons found.
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
  padding: "16px", fontSize: "14px", color: "#334155", verticalAlign: "middle"
};
