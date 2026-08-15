import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";
import useDebounce from "../hooks/useDebounce";

export default function AllAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [viewAdmin, setViewAdmin] = useState(null);
  const [editAdmin, setEditAdmin] = useState(null);

  const fetchAdmins = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${URL}/api/getPaginatedUsersByRole/admin`, { 
        params: { search: debouncedSearch, page, limit },
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(res.data.result || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [debouncedSearch, page, limit]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete administrator account "${name}"?`)) return;
    setActionLoading(id);
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${URL}/api/deleteUser/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Administrator deleted successfully.");
      fetchAdmins();
    } catch (err) {
      alert("Error deleting administrator account.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    setActionLoading(id);
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`${URL}/api/updateUserRole/${id}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Role updated successfully.");
      fetchAdmins();
    } catch (err) {
      alert("Error updating role.");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = admins;

  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          👥 Active Administrators
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          View and manage administrator accounts active on the platform.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ position: "relative", maxWidth: "300px", width: "100%" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              padding: "10px 10px 10px 36px",
              borderRadius: "999px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              width: "100%",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        
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
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          ⏳ Loading administrators list...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          No admin accounts found.
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Email Address</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Role</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Joined Date</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "#1e293b" }}>{user.name || "N/A"}</td>
                  <td style={{ padding: "16px 20px", color: "#475569" }}>{user.email}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <select
                      value={user.role || "admin"}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={actionLoading === user._id}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#faf5ff",
                        color: "#6b21a8",
                        fontSize: "12px",
                        fontWeight: 700,
                        outline: "none",
                        cursor: "pointer"
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#64748b" }}>{formatDate(user.createdAt)}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => setViewAdmin(user)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #3b82f6",
                          background: "transparent",
                          color: "#3b82f6",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3b82f6"; }}
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => setEditAdmin(user)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #eab308",
                          background: "transparent",
                          color: "#eab308",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#eab308"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#eab308"; }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.name || user.email)}
                        disabled={actionLoading === user._id}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #dc2626",
                          background: "transparent",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#dc2626"; }}
                      >
                        {actionLoading === user._id ? "..." : "🗑️ Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1",
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
                  padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1",
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

      {/* View Modal */}
      {viewAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "400px", maxWidth: "90%" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", color: "#0f172a" }}>Admin Details</h2>
            <div style={{ marginBottom: "12px" }}><strong>Name:</strong> {viewAdmin.name || "N/A"}</div>
            <div style={{ marginBottom: "12px" }}><strong>Email:</strong> {viewAdmin.email}</div>
            <div style={{ marginBottom: "12px" }}><strong>Role:</strong> {viewAdmin.role}</div>
            <div style={{ marginBottom: "24px" }}><strong>Joined:</strong> {formatDate(viewAdmin.createdAt)}</div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setViewAdmin(null)} style={{ padding: "8px 16px", background: "#cbd5e1", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "400px", maxWidth: "90%" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", color: "#0f172a" }}>Edit Admin Role</h2>
            <div style={{ marginBottom: "12px" }}><strong>Name:</strong> {editAdmin.name || "N/A"}</div>
            <div style={{ marginBottom: "12px" }}><strong>Email:</strong> {editAdmin.email}</div>
            <div style={{ marginBottom: "24px" }}>
              <strong>Role: </strong>
              <select
                value={editAdmin.role || "admin"}
                onChange={(e) => setEditAdmin({ ...editAdmin, role: e.target.value })}
                style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setEditAdmin(null)} style={{ padding: "8px 16px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, color: "#475569" }}>Cancel</button>
              <button onClick={async () => {
                await handleRoleChange(editAdmin._id, editAdmin.role);
                setEditAdmin(null);
              }} style={{ padding: "8px 16px", background: "#2563eb", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, color: "#fff" }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
