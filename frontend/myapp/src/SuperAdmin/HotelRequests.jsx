import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";

const STATUS_TABS = ["all", "pending", "approved", "rejected"];

const STATUS_CONFIG = {
  pending:  { bg: "#fef9c3", color: "#854d0e", dot: "#eab308", label: "⏳ Pending"  },
  approved: { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "✅ Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "❌ Rejected" },
};

export default function HotelRequests() {
  const [requests, setRequests]           = useState([]);
  const [tab, setTab]                     = useState("all");
  const [search, setSearch]               = useState("");
  const [loading, setLoading]             = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // id of item being acted on


  // Reject modal
  const [showRejectModal, setShowRejectModal]   = useState(false);
  const [rejectingId, setRejectingId]           = useState(null);
  const [rejectionReason, setRejectionReason]   = useState("");
  const [rejectLoading, setRejectLoading]       = useState(false);

  // View modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [imageIndex, setImageIndex]         = useState(0);

  // Upload-images modal (for old requests with no images)
  const [showUploadModal, setShowUploadModal]   = useState(false);
  const [uploadingForId, setUploadingForId]     = useState(null);
  const [uploadingForName, setUploadingForName] = useState("");
  const [pendingFiles, setPendingFiles]         = useState([]);   // File objects
  const [pendingPreviews, setPendingPreviews]   = useState([]);   // blob URLs
  const [uploadSaving, setUploadSaving]         = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url =
        tab === "all"
          ? `${URL}/api/getAllHotelRequests`
          : `${URL}/api/getHotelRequestsByStatus/${tab}`;

      const res = await axios.get(url);
      setRequests(res.data.result || []);
    } catch (err) {
      console.log(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [tab]);

  // ── Convert File → base64 ─────────────────────────────────────────────────
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this hotel listing request? This will create an account and send login credentials to the owner.")) return;
    setActionLoading(id);
    try {
      await axios.patch(`${URL}/api/approveHotelRequest/${id}`);
      fetchRequests();
    } catch (err) {
      alert("Failed to approve request");
    } finally {
      setActionLoading(null);
    }
  };

  

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) { alert("Please provide a rejection reason"); return; }
    setRejectLoading(true);
    try {
      await axios.patch(`${URL}/api/rejectHotelRequest/${rejectingId}`, {
        rejectionReason: rejectionReason.trim(),
      });
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectionReason("");
      fetchRequests();
    } catch (err) {
      alert("Failed to reject request");
    } finally {
      setRejectLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────
  const handleDelete = async (id, hotelName) => {
    if (!window.confirm(`Permanently delete "${hotelName}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await axios.delete(`${URL}/api/deleteHotelRequest/${id}`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete request");
    } finally {
      setActionLoading(null);
    }
  };

  const openViewModal = (item) => {
    setViewingRequest(item);
    setImageIndex(0);
    setShowViewModal(true);
  };

  // ── Open the Upload-Images modal for a specific request ───────────────────
  const openUploadModal = (item) => {
    setUploadingForId(item._id);
    setUploadingForName(item.hotelName);
    setPendingFiles([]);
    setPendingPreviews([]);
    setShowUploadModal(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setPendingFiles((prev) => [...prev, ...files]);
    setPendingPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removePreview = (idx) => {
    setPendingFiles((prev)    => prev.filter((_, i) => i !== idx));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveImages = async () => {
    if (!pendingFiles.length) { alert("Please select at least one image."); return; }
    setUploadSaving(true);
    try {
      // Convert all files to base64
      const base64List = await Promise.all(pendingFiles.map((f) => toBase64(f)));
      const res = await axios.patch(`${URL}/api/updateHotelImages/${uploadingForId}`, {
        images: base64List,
      });
      alert(res.data.message);
      setShowUploadModal(false);
      fetchRequests(); // refresh the grid
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed. Check your Cloudinary credentials.");
    } finally {
      setUploadSaving(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";

  const filtered = requests.filter(
    (r) =>
      (r.hotelName || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.ownerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.place     || "").toLowerCase().includes(search.toLowerCase())
  );

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = {
    pending:  requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          🏨 Hotel Listing Requests
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Review, approve or reject hotel applications submitted by owners.
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
        {[
          { label: "Pending Review", count: counts.pending,  bg: "#fef9c3", color: "#854d0e", icon: "⏳" },
          { label: "Approved",       count: counts.approved, bg: "#dcfce7", color: "#166534", icon: "✅" },
          { label: "Rejected",       count: counts.rejected, bg: "#fee2e2", color: "#991b1b", icon: "❌" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              flex: "1 1 140px",
              background: stat.bg,
              borderRadius: "14px",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <span style={{ fontSize: "28px" }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.count}</div>
              <div style={{ fontSize: "12px", color: stat.color, fontWeight: 600, marginTop: "2px" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            id={`tab-${t}`}
            onClick={() => setTab(t)}
            style={{
              border: "none",
              padding: "8px 18px",
              borderRadius: "999px",
              background: tab === t ? "#2563eb" : "#e2e8f0",
              color: tab === t ? "#fff" : "#475569",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "capitalize",
              transition: "all 0.2s",
            }}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            {t !== "all" && (
              <span
                style={{
                  marginLeft: "6px",
                  background: tab === t ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)",
                  borderRadius: "999px",
                  padding: "1px 7px",
                  fontSize: "11px",
                }}
              >
                {counts[t] ?? requests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <input
        id="hotel-search"
        type="text"
        placeholder="🔍  Search by hotel name, owner or location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 16px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          marginBottom: "24px",
          boxSizing: "border-box",
          fontSize: "14px",
          outline: "none",
          background: "#f8fafc",
        }}
      />

      {/* ── Cards Grid ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "16px" }}>
          ⏳ Loading requests...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#94a3b8",
            background: "#f8fafc",
            borderRadius: "16px",
            border: "1px dashed #cbd5e1",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "14px" }}>📭</div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: "16px" }}>No requests found.</p>
          <p style={{ margin: "6px 0 0", fontSize: "13px" }}>Try a different filter or search term.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "20px",
          }}
        >
          {filtered.map((item) => {
            const st  = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const busy = actionLoading === item._id;
            return (
              <div
                key={item._id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.05)"; }}
              >
                {/* Hotel Image Banner */}
                <div
                  style={{
                    position: "relative",
                    height: "180px",
                    background: "linear-gradient(135deg, #1e3a5f, #0f172a)",
                    overflow: "hidden",
                  }}
                >
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.hotelName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "10px" }}>
                      <span style={{ fontSize: "48px", opacity: 0.5 }}>🏨</span>
                      {/* Orange button to fix old records with no images */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openUploadModal(item); }}
                        style={{
                          padding: "6px 16px",
                          background: "#f97316",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        📷 Upload Images
                      </button>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))" }} />

                  {/* Status badge on image */}
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: st.bg,
                      color: st.color,
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: "999px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    {st.label}
                  </div>

                  {/* Image count badge */}
                  {item.images && item.images.length > 1 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "12px",
                        background: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                      }}
                    >
                      📷 {item.images.length} photos
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: "17px", color: "#0f172a", fontWeight: 700 }}>
                    {item.hotelName}
                  </h3>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#64748b" }}>
                    📍 {item.place}
                  </p>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
                    👤 {item.ownerName}&nbsp;·&nbsp;📧 {item.ownerEmail}
                    {item.ownerPhone && ` · 📞 ${item.ownerPhone}`}
                  </p>

                  {/* Facilities */}
                  {item.facilities && item.facilities.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                      {item.facilities.slice(0, 4).map((f) => (
                        <span
                          key={f}
                          style={{
                            background: "#f1f5f9",
                            color: "#475569",
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontWeight: 500,
                          }}
                        >
                          {f}
                        </span>
                      ))}
                      {item.facilities.length > 4 && (
                        <span style={{ fontSize: "11px", color: "#94a3b8", alignSelf: "center" }}>
                          +{item.facilities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Rejection reason */}
                  {item.status === "rejected" && item.rejectionReason && (
                    <div
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        color: "#991b1b",
                        marginBottom: "10px",
                      }}
                    >
                      <strong>Rejection Reason:</strong> {item.rejectionReason}
                    </div>
                  )}

                  <p style={{ margin: "auto 0 0", fontSize: "11px", color: "#94a3b8", paddingTop: "8px" }}>
                    Submitted: {formatDate(item.createdAt)}
                  </p>

                  {/* ── Action Buttons ── */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                    {/* View button always shown */}
                    <button
                      id={`view-${item._id}`}
                      onClick={() => openViewModal(item)}
                      style={{
                        flex: 1,
                        padding: "9px 0",
                        borderRadius: "9px",
                        border: "1px solid #0ea5e9",
                        background: "transparent",
                        color: "#0ea5e9",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "13px",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#0ea5e9"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#0ea5e9"; }}
                    >
                      👁 View
                    </button>

                    {/* Approve button — shown when pending or rejected */}
                    {(item.status === "pending" || item.status === "rejected") && (
                      <button
                        id={`approve-${item._id}`}
                        onClick={() => handleApprove(item._id)}
                        disabled={busy}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          borderRadius: "9px",
                          border: "none",
                          background: busy ? "#86efac" : "#16a34a",
                          color: "#fff",
                          cursor: busy ? "not-allowed" : "pointer",
                          fontWeight: 600,
                          fontSize: "13px",
                          transition: "background 0.15s",
                        }}
                      >
                        {busy ? "..." : "✅ Approve"}
                      </button>
                    )}

                    {/* Reject button — shown when pending or approved */}
                    {(item.status === "pending" || item.status === "approved") && (
                      <button
                        id={`reject-${item._id}`}
                        onClick={() => openRejectModal(item._id)}
                        disabled={busy}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          borderRadius: "9px",
                          border: "none",
                          background: busy ? "#fca5a5" : "#dc2626",
                          color: "#fff",
                          cursor: busy ? "not-allowed" : "pointer",
                          fontWeight: 600,
                          fontSize: "13px",
                          transition: "background 0.15s",
                        }}
                      >
                        {busy ? "..." : "❌ Reject"}
                      </button>
                    )}

                    {/* Delete button — always shown, icon only */}
                    <button
                      id={`delete-${item._id}`}
                      title="Delete this request permanently"
                      onClick={() => handleDelete(item._id, item.hotelName)}
                      disabled={busy}
                      style={{
                        width: "36px",
                        flexShrink: 0,
                        padding: "9px 0",
                        borderRadius: "9px",
                        border: "1.5px solid #dc2626",
                        background: "transparent",
                        color: "#dc2626",
                        cursor: busy ? "not-allowed" : "pointer",
                        fontSize: "15px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#dc2626"; }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════ Reject Modal ══════════════════════ */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => { setShowRejectModal(false); setRejectionReason(""); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "32px",
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "28px" }}>❌</span>
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "18px" }}>Reject Hotel Request</h3>
            </div>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "14px" }}>
              Provide a clear reason. It will be sent to the hotel owner via email.
            </p>
            <form onSubmit={handleReject}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px", color: "#374151" }}>
                Rejection Reason *
              </label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Insufficient images, incomplete description, invalid location..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  marginBottom: "18px",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: rejectLoading ? "#fca5a5" : "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: rejectLoading ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  {rejectLoading ? "Sending..." : "📧 Send Rejection Email"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRejectModal(false); setRejectionReason(""); }}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#475569",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════ View Details Modal ══════════════════════ */}
      {showViewModal && viewingRequest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowViewModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with image */}
            <div style={{ position: "relative", height: "220px", background: "#0f172a", borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
              {viewingRequest.images && viewingRequest.images.length > 0 ? (
                <img
                  src={viewingRequest.images[imageIndex]}
                  alt="hotel"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <span style={{ fontSize: "64px", opacity: 0.4 }}>🏨</span>
                </div>
              )}

              {/* Navigation arrows */}
              {viewingRequest.images && viewingRequest.images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIndex((i) => (i - 1 + viewingRequest.images.length) % viewingRequest.images.length)}
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", fontSize: "20px" }}
                  >‹</button>
                  <button
                    onClick={() => setImageIndex((i) => (i + 1) % viewingRequest.images.length)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", fontSize: "20px" }}
                  >›</button>
                  <span style={{ position: "absolute", bottom: "10px", right: "14px", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "12px", padding: "2px 10px", borderRadius: "999px" }}>
                    {imageIndex + 1} / {viewingRequest.images.length}
                  </span>
                </>
              )}

              {/* Close button */}
              <button
                onClick={() => setShowViewModal(false)}
                style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", fontSize: "18px" }}
              >✕</button>

              {/* Status overlay badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "14px",
                  background: STATUS_CONFIG[viewingRequest.status]?.bg || "#fef9c3",
                  color: STATUS_CONFIG[viewingRequest.status]?.color || "#854d0e",
                  fontSize: "13px",
                  fontWeight: 700,
                  padding: "4px 14px",
                  borderRadius: "999px",
                }}
              >
                {STATUS_CONFIG[viewingRequest.status]?.label}
              </div>
            </div>

            {/* Thumbnails */}
            {viewingRequest.images && viewingRequest.images.length > 1 && (
              <div style={{ display: "flex", gap: "8px", padding: "12px 20px 0", overflowX: "auto" }}>
                {viewingRequest.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => setImageIndex(i)}
                    alt=""
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      cursor: "pointer",
                      flexShrink: 0,
                      border: i === imageIndex ? "2.5px solid #2563eb" : "2.5px solid transparent",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Details */}
            <div style={{ padding: "20px 24px 28px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "20px", color: "#0f172a" }}>
                🏨 {viewingRequest.hotelName}
              </h3>

              {[
                { label: "Owner Name",  value: viewingRequest.ownerName },
                { label: "Owner Email", value: viewingRequest.ownerEmail },
                { label: "Phone",       value: viewingRequest.ownerPhone || "—" },
                { label: "Location",    value: viewingRequest.place },
                { label: "Description", value: viewingRequest.description || "—" },
                { label: "Submitted",   value: formatDate(viewingRequest.createdAt) },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "10px 14px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{row.label}</span>
                  <span style={{ fontSize: "14px", color: "#0f172a", fontWeight: 500, textAlign: "right" }}>{row.value}</span>
                </div>
              ))}

              {/* Facilities */}
              {viewingRequest.facilities && viewingRequest.facilities.length > 0 && (
                <div style={{ marginTop: "14px" }}>
                  <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>
                    Facilities
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {viewingRequest.facilities.map((f) => (
                      <span key={f} style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "12px", padding: "4px 10px", borderRadius: "6px", fontWeight: 600 }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection reason */}
              {viewingRequest.status === "rejected" && viewingRequest.rejectionReason && (
                <div style={{ marginTop: "16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "14px 16px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#991b1b", fontWeight: 700, textTransform: "uppercase" }}>Rejection Reason</p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#7f1d1d" }}>{viewingRequest.rejectionReason}</p>
                </div>
              )}

              {/* Action buttons in modal */}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                {(viewingRequest.status === "pending" || viewingRequest.status === "rejected") && (
                  <button
                    onClick={() => { setShowViewModal(false); handleApprove(viewingRequest._id); }}
                    style={{ flex: 1, padding: "11px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}
                  >
                    ✅ Approve &amp; Send Credentials
                  </button>
                )}
                {(viewingRequest.status === "pending" || viewingRequest.status === "approved") && (
                  <button
                    onClick={() => { setShowViewModal(false); openRejectModal(viewingRequest._id); }}
                    style={{ flex: 1, padding: "11px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}
                  >
                    ❌ Reject
                  </button>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  style={{ flex: 1, padding: "11px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ Upload Images Modal ══════════════════════ */}
      {showUploadModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => { if (!uploadSaving) setShowUploadModal(false); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "32px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "26px" }}>📷</span>
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "18px" }}>Upload Images</h3>
            </div>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "13px" }}>
              Uploading images for: <strong>{uploadingForName}</strong>
            </p>

            {/* Previews */}
            {pendingPreviews.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {pendingPreviews.map((src, i) => (
                  <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: "10px", overflow: "hidden", border: "2px solid #e2e8f0" }}>
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={() => removePreview(i)}
                      style={{
                        position: "absolute", top: "3px", right: "3px",
                        background: "rgba(0,0,0,0.65)", border: "none",
                        color: "#fff", borderRadius: "50%",
                        width: "20px", height: "20px",
                        fontSize: "13px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {/* File picker */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                border: "2px dashed #cbd5e1",
                borderRadius: "12px",
                padding: "20px",
                cursor: "pointer",
                background: "#f8fafc",
                color: "#475569",
                fontWeight: 600,
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFileSelect}
                disabled={uploadSaving}
              />
              ➕ {pendingPreviews.length > 0 ? "Add More Photos" : "Select Hotel Photos"}
            </label>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSaveImages}
                disabled={uploadSaving || pendingFiles.length === 0}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: uploadSaving || pendingFiles.length === 0 ? "#94a3b8" : "#f97316",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  cursor: uploadSaving || pendingFiles.length === 0 ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                {uploadSaving
                  ? "⏳ Uploading to Cloudinary..."
                  : `☁️ Upload ${pendingFiles.length > 0 ? pendingFiles.length + " " : ""}Image${pendingFiles.length !== 1 ? "s" : ""} to Cloudinary`}
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploadSaving}
                style={{
                  padding: "12px 20px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "10px",
                  cursor: uploadSaving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#475569",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
