import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";

const STATUS_TABS = ["all", "pending", "approved", "rejected"];

const STATUS_CONFIG = {
  pending: { bg: "#fef9c3", color: "#854d0e", label: "⏳ Pending" },
  approved: { bg: "#dcfce7", color: "#166534", label: "✅ Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b", label: "❌ Rejected" },
};

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/getAllAdminRequests`);
      setRequests(res.data.result || []);
    } catch (err) {
      console.log(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    if (
      !window.confirm(
        "Approve this admin request? Login credentials will be emailed to the applicant."
      )
    ) {
      return;
    }

    setActionLoading(id);
    try {
      const res = await axios.patch(`${URL}/api/approveAdminRequest/${id}`);
      alert(
        res.data.message ||
          "Admin approved! Login credentials have been emailed. The user can log in without signing up."
      );
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve request");
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
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setRejectLoading(true);
    try {
      await axios.patch(`${URL}/api/rejectAdminRequest/${rejectingId}`, {
        rejectionReason: rejectionReason.trim(),
      });
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectionReason("");
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject request");
    } finally {
      setRejectLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete request from "${name}"?`)) return;

    setActionLoading(id);
    try {
      await axios.delete(`${URL}/api/deleteAdminRequest/${id}`);
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
    d
      ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const tabFiltered =
    tab === "all" ? requests : requests.filter((r) => r.status === tab);

  const filtered = tabFiltered.filter(
    (r) =>
      (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.occupation || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.mobileNumber || "").includes(search)
  );

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          👤 Admin Access Requests
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Review admin applications, approve login access, or reject with a reason.
        </p>
      </div>

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
              <div style={{ fontSize: "26px", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                {stat.count}
              </div>
              <div style={{ fontSize: "12px", color: stat.color, fontWeight: 600, marginTop: "2px" }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t}
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
            }}
          >
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search by name, email, occupation, or mobile..."
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

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          Loading requests...
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
          <p style={{ margin: 0, fontWeight: 600 }}>No admin requests found.</p>
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
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                    color: "#fff",
                    padding: "20px",
                    position: "relative",
                  }}
                >
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
                  <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>{item.name}</h3>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: "13px" }}>{item.email}</p>
                </div>

                <div style={{ padding: "18px 20px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
                    📱 {item.mobileNumber}
                  </p>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
                    💼 {item.occupation}
                  </p>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
                    📍 {item.address}
                  </p>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b" }}>
                    ⚖️ Criminal case: {item.criminalCase ? "Yes" : "No"}
                  </p>

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

                  <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                    Submitted: {formatDate(item.createdAt)}
                  </p>

                  <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
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
                      View
                    </button>

                    {(item.status === "pending" || item.status === "rejected") && (
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
                        Approve
                      </button>
                    )}

                    {(item.status === "pending" || item.status === "approved") && (
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
                        Reject
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(item._id, item.name)}
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
          onClick={() => {
            setShowRejectModal(false);
            setRejectionReason("");
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "32px",
              width: "100%",
              maxWidth: "460px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>Reject Admin Request</h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "14px" }}>
              Provide a reason. It will be emailed to the applicant.
            </p>
            <form onSubmit={handleReject}>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Incomplete information, invalid details..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  resize: "vertical",
                  boxSizing: "border-box",
                  marginBottom: "18px",
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
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {rejectLoading ? "Sending..." : "Send Rejection Email"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>{viewingRequest.name}</h2>
            <p><strong>Email:</strong> {viewingRequest.email}</p>
            <p><strong>Mobile:</strong> {viewingRequest.mobileNumber}</p>
            <p><strong>Occupation:</strong> {viewingRequest.occupation}</p>
            <p><strong>Address:</strong> {viewingRequest.address}</p>
            <p><strong>Criminal Case:</strong> {viewingRequest.criminalCase ? "Yes" : "No"}</p>
            <p><strong>Status:</strong> {viewingRequest.status}</p>
            <p><strong>Role:</strong> {viewingRequest.role || "user"}</p>
            <p><strong>Verified:</strong> {viewingRequest.verified ? "Yes" : "No"}</p>
            <p><strong>Submitted:</strong> {formatDate(viewingRequest.createdAt)}</p>

            {viewingRequest.rejectionReason && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  padding: "12px",
                  borderRadius: "8px",
                  color: "#991b1b",
                }}
              >
                <strong>Rejection Reason:</strong> {viewingRequest.rejectionReason}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              {(viewingRequest.status === "pending" || viewingRequest.status === "rejected") && (
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
                  Approve
                </button>
              )}

              {(viewingRequest.status === "pending" || viewingRequest.status === "approved") && (
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
                  Reject
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
      )}
    </div>
  );
}
