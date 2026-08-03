import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";
import { Tags, Search, CheckCircle, XCircle, PlusCircle, X } from "lucide-react";
import useDebounce from "../hooks/useDebounce";

export default function Coupons() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [showModal, setShowModal] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({
    hotel: "", couponCode: "", discountType: "fixed", discount: "",
    maximumDiscount: "0", minimumBookingAmount: "0", maxUsage: "100", expiryDate: ""
  });

  const fetchCouponsAndHotels = async () => {
    if (!user.email) return;
    setLoading(true);
    try {
      const [couponRes, hotelRes] = await Promise.all([
        axios.get(`${URL}/api/getCouponsByAdmin/${user.email}`, { params: { search: debouncedSearch } }),
        axios.get(`${URL}/api/getRequestsByAdmin/${user.email}`)
      ]);
      if (couponRes.data.success) setCoupons(couponRes.data.coupons || []);
      if (hotelRes.data.result) setHotels(hotelRes.data.result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsAndHotels();
  }, [debouncedSearch]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.hotel === "ALL") {
        payload.hotel = "";
        payload.adminEmail = user.email;
      } else {
        payload.adminEmail = "";
      }

      const res = await axios.post(`${URL}/api/createCoupon`, payload);
      if (res.data.success) {
        alert("Coupon created successfully!");
        setShowModal(false);
        fetchCouponsAndHotels();
        setForm({ hotel: "", couponCode: "", discountType: "fixed", discount: "", maximumDiscount: "0", minimumBookingAmount: "0", maxUsage: "100", expiryDate: "" });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error creating coupon");
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    if (!window.confirm(`Are you sure you want to mark this coupon as ${newStatus}?`)) return;

    try {
      const res = await axios.patch(`${URL}/api/changeCouponStatus/${id}`, { status: newStatus });
      if (res.data.success) {
        alert("Coupon status updated successfully");
        fetchCouponsAndHotels();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const filteredCoupons = coupons;

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
        <button 
          onClick={() => setShowModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: "8px", background: "#3b82f6", color: "#fff",
            border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)", transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#2563eb"}
          onMouseLeave={e => e.currentTarget.style.background = "#3b82f6"}
        >
          <PlusCircle size={18} /> Create Coupon
        </button>
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
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {!coupon.hotel && coupon.adminEmail ? "ALL MY HOTELS" : coupon.hotel?.hotelName || "N/A"}
                      </div>
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

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "500px", borderRadius: "16px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>Create New Coupon</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer" }}><X size={20} color="#64748b" /></button>
            </div>
            <form onSubmit={handleCreateCoupon} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Select Hotel *</label>
                <select style={inputStyle} required value={form.hotel} onChange={e => setForm({...form, hotel: e.target.value})}>
                  <option value="">-- Choose Hotel --</option>
                  <option value="ALL">🌟 Apply to ALL My Hotels</option>
                  {hotels.map(h => <option key={h._id} value={h._id}>{h.hotelName}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Coupon Code *</label>
                <input style={inputStyle} required placeholder="e.g. SUMMER50" value={form.couponCode} onChange={e => setForm({...form, couponCode: e.target.value})} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Discount Type</label>
                  <select style={inputStyle} value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})}>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Discount Value *</label>
                  <input style={inputStyle} type="number" required value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Max Discount (₹)</label>
                  <input style={inputStyle} type="number" value={form.maximumDiscount} onChange={e => setForm({...form, maximumDiscount: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Min Booking (₹) *</label>
                  <input style={inputStyle} type="number" required value={form.minimumBookingAmount} onChange={e => setForm({...form, minimumBookingAmount: e.target.value})} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Max Usage *</label>
                  <input style={inputStyle} type="number" required value={form.maxUsage} onChange={e => setForm({...form, maxUsage: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Expiry Date *</label>
                  <input style={inputStyle} type="date" required value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} />
                </div>
              </div>
              <button type="submit" style={{ background: "#3b82f6", color: "#fff", padding: "12px", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer", marginTop: "10px" }}>Create Coupon</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const labelStyle = { display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, color: "#475569", textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", boxSizing: "border-box", outline: "none", backgroundColor: "#f8fafc" };

const thStyle = {
  padding: "16px", fontSize: "13px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px"
};

const tdStyle = {
  padding: "16px", fontSize: "14px", color: "#334155", verticalAlign: "middle"
};
