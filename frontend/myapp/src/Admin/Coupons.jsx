import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";
import { Tags, Search, CheckCircle, XCircle, PlusCircle, X, Download, Building2, ArrowUpDown } from "lucide-react";
import useDebounce from "../hooks/useDebounce";
import { useOutletContext } from "react-router-dom";

export default function Coupons() {
  const { theme } = useOutletContext() || { theme: "light" };
  const isDark = theme !== "dark";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
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
      payload.adminEmail = user.email;
      if (payload.hotel === "ALL") {
        payload.hotel = "";
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

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editCoupon };
      payload.adminEmail = user.email;
      if (payload.hotel === "ALL") {
        payload.hotel = null;
      }

      const res = await axios.patch(`${URL}/api/updateCoupon/${editCoupon._id}`, payload);
      if (res.data.success) {
        alert("Coupon updated successfully");
        setEditCoupon(null);
        fetchCouponsAndHotels();
      } else {
        alert(res.data.message || "Failed to update coupon");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error updating coupon");
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



  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredCoupons = [...coupons]
    .filter(coupon => {
      if (!debouncedSearch) return true;
      const term = debouncedSearch.toLowerCase();
      const codeMatch = coupon.couponCode?.toLowerCase().includes(term);
      const hotelName = coupon.hotel?.hotelName || (coupon.adminEmail && !coupon.hotel ? "All Hotels" : "");
      const hotelMatch = hotelName.toLowerCase().includes(term);
      return codeMatch || hotelMatch;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === 'hotelName') {
        valA = a.hotel?.hotelName || (a.adminEmail && !a.hotel ? "All Hotels" : "");
        valB = b.hotel?.hotelName || (b.adminEmail && !b.hotel ? "All Hotels" : "");
      } else if (sortConfig.key === 'expiryDate' || sortConfig.key === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "10px" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "24px", color: isDark ? "#f8fafc" : "#0f172a", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Tags size={24} color="#3b82f6" />
            Offers & Coupons
          </h2>
          <p style={{ margin: 0, color: isDark ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
            Dashboard / Offers & Coupons
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
            <a 
              href={`${URL}/api/pdf/coupons?adminEmail=${user.email}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: "8px", background: "#10b981", color: "#fff", textDecoration: "none",
                border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", boxSizing: "border-box",
                boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)", transition: "all 0.2s"
              }}
            >
              <Download size={18} /> Download PDF
            </a>
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
      </div>

      {/* Search */}
      <div style={{ position: "relative", width: "300px", marginBottom: "24px" }}>
        <Search size={18} color={isDark ? "#94a3b8" : "#64748b"} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
        <input
          type="text"
          placeholder="Search by code or hotel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%", padding: "10px 10px 10px 36px", borderRadius: "8px",
            border: isDark ? "1px solid #475569" : "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "14px",
            background: isDark ? "#0f172a" : "#fff", color: isDark ? "#f8fafc" : "#0f172a"
          }}
        />
      </div>

      {/* Table */}
      <div style={{
        background: isDark ? "#1e293b" : "#ffffff", borderRadius: "16px", border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)", overflow: "hidden"
      }}>
        <div style={{ overflowX: "auto", borderRadius: "12px", border: isDark ? "1px solid #334155" : "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px" }}>
            <thead>
              <tr style={{ background: isDark ? "#334155" : "#f8fafc", borderBottom: isDark ? "2px solid #475569" : "2px solid #e2e8f0" }}>
                <th onClick={() => handleSort('couponCode')} style={{ cursor: "pointer", padding: "16px", fontSize: "13px", fontWeight: 600, color: isDark ? "#e2e8f0" : "#475569", textTransform: "uppercase", textAlign: "left" }}>
                  Code & Hotel <ArrowUpDown size={12} style={{ marginLeft: "4px" }} />
                </th>
                <th onClick={() => handleSort('discount')} style={{ cursor: "pointer", padding: "16px", fontSize: "13px", fontWeight: 600, color: isDark ? "#e2e8f0" : "#475569", textTransform: "uppercase", textAlign: "left" }}>
                  Discount <ArrowUpDown size={12} style={{ marginLeft: "4px" }} />
                </th>
                <th onClick={() => handleSort('maxUsage')} style={{ cursor: "pointer", padding: "16px", fontSize: "13px", fontWeight: 600, color: isDark ? "#e2e8f0" : "#475569", textTransform: "uppercase", textAlign: "left" }}>
                  Usage limits <ArrowUpDown size={12} style={{ marginLeft: "4px" }} />
                </th>
                <th onClick={() => handleSort('expiryDate')} style={{ cursor: "pointer", padding: "16px", fontSize: "13px", fontWeight: 600, color: isDark ? "#e2e8f0" : "#475569", textTransform: "uppercase", textAlign: "left" }}>
                  Expiry Date <ArrowUpDown size={12} style={{ marginLeft: "4px" }} />
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: "pointer", padding: "16px", fontSize: "13px", fontWeight: 600, color: isDark ? "#e2e8f0" : "#475569", textTransform: "uppercase", textAlign: "center" }}>
                  Status <ArrowUpDown size={12} style={{ marginLeft: "4px" }} />
                </th>
                <th style={{ padding: "16px", fontSize: "13px", fontWeight: 600, color: isDark ? "#e2e8f0" : "#475569", textTransform: "uppercase", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "20px", textAlign: "center", color: isDark ? "#64748b" : "#64748b" }}>Loading coupons...</td></tr>
              ) : filteredCoupons.length > 0 ? (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} style={{ borderTop: isDark ? "1px solid #334155" : "1px solid #e2e8f0" }}>
                    <td style={{ padding: "16px", fontSize: "14px", color: isDark ? "#f8fafc" : "#334155", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 700, fontFamily: "monospace", fontSize: "15px" }}>{coupon.couponCode}</div>
                      <div style={{ fontSize: "12px", color: isDark ? "#94a3b8" : "#64748b", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Building2 size={14} /> 
                        {!coupon.hotel && coupon.adminEmail ? "All Hotels" : coupon.hotel?.hotelName || "N/A"}
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: isDark ? "#f8fafc" : "#334155", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 600, color: "#10b981" }}>
                        {coupon.discountType === "percentage" ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                      </div>
                      {coupon.minimumBookingAmount > 0 && (
                        <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", marginTop: "4px" }}>
                          Min booking: ₹{coupon.minimumBookingAmount}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: isDark ? "#f8fafc" : "#334155", verticalAlign: "middle" }}>
                      <div>Max Usage: {coupon.maxUsage || "Unlimited"}</div>
                      <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", marginTop: "4px" }}>
                        Used: {coupon.usedCount || 0} times
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: isDark ? "#f8fafc" : "#334155", verticalAlign: "middle" }}>
                      <div style={{ color: new Date(coupon.expiryDate) < new Date() ? "#dc2626" : (isDark ? "#94a3b8" : "#475569") }}>
                        {new Date(coupon.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: isDark ? "#f8fafc" : "#334155", verticalAlign: "middle", textAlign: "center" }}>
                      <span style={{
                        background: coupon.status === "Active" ? (isDark ? "rgba(16, 185, 129, 0.2)" : "#dcfce7") : (isDark ? "rgba(239, 68, 68, 0.2)" : "#fee2e2"),
                        color: coupon.status === "Active" ? (isDark ? "#34d399" : "#166534") : (isDark ? "#f87171" : "#991b1b"),
                        padding: "6px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: 600
                      }}>
                        {coupon.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontSize: "14px", color: isDark ? "#f8fafc" : "#334155", verticalAlign: "middle", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button onClick={() => setEditCoupon(coupon)} style={{ background: "transparent", border: "1px solid #3b82f6", cursor: "pointer", color: "#3b82f6", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>Edit</button>
                        <button onClick={() => handleStatusChange(coupon._id, coupon.status)} style={{ background: "transparent", border: "1px solid #e2e8f0", cursor: "pointer", color: coupon.status === "Active" ? "#dc2626" : "#10b981", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>{coupon.status === "Active" ? "Deactivate" : "Activate"}</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} style={{ padding: "20px", textAlign: "center", color: isDark ? "#64748b" : "#64748b" }}>No coupons found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
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

      {/* Edit Modal */}
      {editCoupon && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "500px", borderRadius: "16px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>Edit Coupon Info</h3>
              <button onClick={() => setEditCoupon(null)} style={{ background: "transparent", border: "none", cursor: "pointer" }}><X size={20} color="#64748b" /></button>
            </div>
            <form onSubmit={handleUpdateCoupon} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Select Hotel *</label>
                <select style={inputStyle} required value={editCoupon.hotel?._id || editCoupon.hotel || (editCoupon.adminEmail ? "ALL" : "")} onChange={e => setEditCoupon({...editCoupon, hotel: e.target.value})}>
                  <option value="">-- Choose Hotel --</option>
                  <option value="ALL">🌟 Apply to ALL My Hotels</option>
                  {hotels.map(h => <option key={h._id} value={h._id}>{h.hotelName}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Coupon Code *</label>
                <input style={inputStyle} required value={editCoupon.couponCode} onChange={e => setEditCoupon({...editCoupon, couponCode: e.target.value})} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Discount Type</label>
                  <select style={inputStyle} value={editCoupon.discountType} onChange={e => setEditCoupon({...editCoupon, discountType: e.target.value})}>
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Discount Value *</label>
                  <input style={inputStyle} type="number" required value={editCoupon.discount} onChange={e => setEditCoupon({...editCoupon, discount: e.target.value})} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Max Discount (₹)</label>
                  <input style={inputStyle} type="number" value={editCoupon.maximumDiscount} onChange={e => setEditCoupon({...editCoupon, maximumDiscount: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Min Booking (₹) *</label>
                  <input style={inputStyle} type="number" required value={editCoupon.minimumBookingAmount} onChange={e => setEditCoupon({...editCoupon, minimumBookingAmount: e.target.value})} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Max Usage *</label>
                  <input style={inputStyle} type="number" required value={editCoupon.maxUsage} onChange={e => setEditCoupon({...editCoupon, maxUsage: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Expiry Date *</label>
                  <input style={inputStyle} type="date" required value={editCoupon.expiryDate ? new Date(editCoupon.expiryDate).toISOString().split('T')[0] : ''} onChange={e => setEditCoupon({...editCoupon, expiryDate: e.target.value})} />
                </div>
              </div>
              <button type="submit" style={{ background: "#eab308", color: "#fff", padding: "12px", borderRadius: "8px", border: "none", fontWeight: 600, cursor: "pointer", marginTop: "10px" }}>Save Changes</button>
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
