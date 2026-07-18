import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";

const STATUS_TABS = ["all", "pending", "approved", "rejected"];

const STATUS_CONFIG = {
  pending: { bg: "#fef9c3", color: "#854d0e",  label: "⏳ Pending" },
  approved: { bg: "#dcfce7", color: "#166534", label: "✅ Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b",  label: "❌ Rejected" },
};

const formatLocation = (location) => {
  if (!location) return "N/A";
  if (typeof location === "string") return location;
  const city = location.cityname || "";
  const district = location.district?.districtname || "";
  const state = location.state?.Statename || "";
  return [city, district, state].filter(Boolean).join(", ") || "N/A";
};

export default function HotelRequests() {
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // id of item being acted on


  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // View modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);


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


  // ── Actions ───────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this hotel listing request? The admin will be notified by email.")) return;
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
    setShowViewModal(true);
  };








  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";

  const filtered = requests.filter(
    (r) =>
      (r.hotelName || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.ownerName || "").toLowerCase().includes(search.toLowerCase()) ||
      formatLocation(r.location).toLowerCase().includes(search.toLowerCase()) ||
      (r.submittedBy || "").toLowerCase().includes(search.toLowerCase())
  );

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
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
          { label: "Pending Review", count: counts.pending, bg: "#fef9c3", color: "#854d0e", icon: "⏳" },
          { label: "Approved", count: counts.approved, bg: "#dcfce7", color: "#166534", icon: "✅" },
          { label: "Rejected", count: counts.rejected, bg: "#fee2e2", color: "#991b1b", icon: "❌" },
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
            const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
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
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.05)"; }}
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
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.hotelName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <span style={{ fontSize: "55px", opacity: 0.4 }}>
                        🏨
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "60px",
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,.6))",
                    }}
                  />

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
                    }}
                  >
                    {st.label}
                  </div>
                </div>


                {/* Card Body */}
                <div
                  style={{
                    padding: "18px 20px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 6px",
                      fontSize: "17px",
                      color: "#0f172a",
                      fontWeight: 700,
                    }}
                  >
                    {item.hotelName}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    📍 {formatLocation(item.location)}
                  </p>

                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    👤 {item.ownerName} &nbsp;·&nbsp; 📧 {item.email}
                  </p>

                  {item.submittedBy && (
                    <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#64748b" }}>
                      Submitted by admin: {item.submittedBy}
                    </p>
                  )}

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
                      <strong>Rejection Reason:</strong>{" "}
                      {item.rejectionReason}
                    </div>
                  )}

                  <p
                    style={{
                      margin: "auto 0 0",
                      fontSize: "11px",
                      color: "#94a3b8",
                      paddingTop: "8px",
                    }}
                  >
                    Submitted: {formatDate(item.createdAt)}
                  </p>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "14px",
                    }}
                  >
                    <button
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
                      }}
                    >
                      👁 View
                    </button>

                    {(item.status === "pending" ||
                      item.status === "rejected") && (
                        <button
                          onClick={() => handleApprove(item._id)}
                          disabled={busy}
                          style={{
                            flex: 1,
                            padding: "9px 0",
                            borderRadius: "9px",
                            border: "none",
                            background: "#16a34a",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "13px",
                          }}
                        >
                          ✅ Approve
                        </button>
                      )}

                    {(item.status === "pending" ||
                      item.status === "approved") && (
                        <button
                          onClick={() => openRejectModal(item._id)}
                          style={{
                            flex: 1,
                            padding: "9px 0",
                            borderRadius: "9px",
                            border: "none",
                            background: "#dc2626",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "13px",
                          }}
                        >
                          ❌ Reject
                        </button>
                      )}

                    <button
                      onClick={() =>
                        handleDelete(item._id, item.hotelName)
                      }
                      style={{
                        width: "38px",
                        borderRadius: "9px",
                        border: "1px solid #dc2626",
                        background: "transparent",
                        color: "#dc2626",
                        cursor: "pointer",
                      }}
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
            {/* Image */}
            <div
              style={{
                position: "relative",
                height: "250px",
                background: "#0f172a",
                borderRadius: "20px 20px 0 0",
                overflow: "hidden",
              }}
            >
              {viewingRequest.image ? (
                <img
                  src={viewingRequest.image}
                  alt={viewingRequest.hotelName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <span style={{ fontSize: "70px", opacity: 0.4 }}>
                    🏨
                  </span>
                </div>
              )}

              <button
                onClick={() => setShowViewModal(false)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  width: "36px",
                  height: "36px",
                  border: "none",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,.6)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>

              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "12px",
                  background:
                    STATUS_CONFIG[viewingRequest.status]?.bg,
                  color:
                    STATUS_CONFIG[viewingRequest.status]?.color,
                  padding: "5px 14px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                {STATUS_CONFIG[viewingRequest.status]?.label}
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: "24px" }}>
              <h2
                style={{
                  margin: "0 0 20px",
                  color: "#0f172a",
                }}
              >
                🏨 {viewingRequest.hotelName}
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                <div>
                  <strong>Owner Name:</strong>{" "}
                  {viewingRequest.ownerName}
                </div>

                <div>
                  <strong>Owner Email:</strong>{" "}
                  {viewingRequest.email}
                </div>

                <div>
                  <strong>Submitted By:</strong>{" "}
                  {viewingRequest.submittedBy || "N/A"}
                </div>

                <div>
                  <strong>Location:</strong>{" "}
                  {formatLocation(viewingRequest.location)}
                </div>

                <div>
                  <strong>Description:</strong>
                  <br />
                  {viewingRequest.description}
                </div>

                <div>
                  <strong>Submitted:</strong>{" "}
                  {formatDate(viewingRequest.createdAt)}
                </div>

                {viewingRequest.status === "rejected" &&
                  viewingRequest.rejectionReason && (
                    <div
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        padding: "12px",
                        borderRadius: "8px",
                        color: "#991b1b",
                      }}
                    >
                      <strong>Rejection Reason:</strong>
                      <br />
                      {viewingRequest.rejectionReason}
                    </div>
                  )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "24px",
                }}
              >
                {(viewingRequest.status === "pending" ||
                  viewingRequest.status === "rejected") && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleApprove(viewingRequest._id);
                      }}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      ✅ Approve
                    </button>
                  )}

                {(viewingRequest.status === "pending" ||
                  viewingRequest.status === "approved") && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        openRejectModal(viewingRequest._id);
                      }}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      ❌ Reject
                    </button>
                  )}

                <button
                  onClick={() => setShowViewModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#e2e8f0",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
