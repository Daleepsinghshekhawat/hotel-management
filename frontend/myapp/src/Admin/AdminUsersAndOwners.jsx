import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";
import useDebounce from "../hooks/useDebounce";
import useTheme from "../useTheme";

const ROLE_TABS = ["all", "hotelOwner", "user"];

const ROLE_LABELS = {
  all: "👥 All Accounts",
  hotelOwner: "🏨 Hotel Owners",
  user: "👤 Regular Users",
};

const ROLE_BADGES = {
  hotelOwner: { bg: "#dcfce7", color: "#166534", label: "Hotel Owner" },
  user: { bg: "#e0f2fe", color: "#0369a1", label: "User" },
};

export default function AdminUsersAndOwners() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/getPaginatedUsersByRole/${roleFilter}`, {
        params: { search: debouncedSearch, page, limit, excludeAdmins: true }
      });
      setUsers(res.data.result || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.log("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, debouncedSearch, page, limit]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;

    setActionLoading(id);
    try {
      await axios.delete(`${URL}/api/deleteUser/${id}`);
      alert("User deleted successfully.");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users;

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
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: isDark ? "#0f172a" : "#f8fafc", fontWeight: 700 }}>
          👥 Registered Accounts
        </h2>
        <p style={{ margin: 0, color: isDark ? "#64748b" : "#94a3b8", fontSize: "14px" }}>
          View and manage user accounts and hotel owners registered on the platform.
        </p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {ROLE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setRoleFilter(tab)}
            style={{
              border: "none",
              padding: "10px 20px",
              borderRadius: "999px",
              background: roleFilter === tab ? "#2563eb" : (isDark ? "#e2e8f0" : "#334155"),
              color: roleFilter === tab ? "#fff" : (isDark ? "#475569" : "#cbd5e1"),
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.2s ease",
            }}
          >
            {ROLE_LABELS[tab]}
          </button>
        ))}
        </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ position: "relative", maxWidth: "300px", width: "100%" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              padding: "10px 10px 10px 36px",
              borderRadius: "999px",
              border: isDark ? "1px solid #cbd5e1" : "1px solid #475569",
              fontSize: "14px",
              width: "100%",
              outline: "none",
              background: isDark ? "#fff" : "#1e293b",
              color: isDark ? "#0f172a" : "#f8fafc"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ fontSize: "14px", color: isDark ? "#475569" : "#cbd5e1", fontWeight: 600 }}>Items per page:</label>
          <select 
            value={limit} 
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            style={{
              padding: "8px 12px", borderRadius: "8px", border: isDark ? "1px solid #cbd5e1" : "1px solid #475569",
              background: isDark ? "#fff" : "#1e293b", color: isDark ? "#0f172a" : "#f8fafc", outline: "none", cursor: "pointer"
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
        <div style={{ textAlign: "center", padding: "60px", color: isDark ? "#94a3b8" : "#64748b" }}>
          ⏳ Loading accounts...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: isDark ? "#94a3b8" : "#64748b",
            background: isDark ? "#f8fafc" : "#1e293b",
            borderRadius: "16px",
            border: isDark ? "1px dashed #cbd5e1" : "1px dashed #475569",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "14px" }}>👥</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No accounts found matching search.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "12px", border: isDark ? "1px solid #e2e8f0" : "1px solid #334155", background: isDark ? "#fff" : "#1e293b" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ background: isDark ? "#f8fafc" : "#334155", borderBottom: isDark ? "2px solid #e2e8f0" : "2px solid #475569" }}>
                <th style={{ padding: "16px 20px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600 }}>Name</th>
                <th style={{ padding: "16px 20px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600 }}>Email Address</th>
                <th style={{ padding: "16px 20px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600 }}>Role</th>
                <th style={{ padding: "16px 20px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600 }}>Joined Date</th>
                <th style={{ padding: "16px 20px", color: isDark ? "#475569" : "#94a3b8", fontWeight: 600, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const badge = ROLE_BADGES[user.role] || { bg: isDark ? "#f1f5f9" : "#334155", color: isDark ? "#475569" : "#e2e8f0", label: user.role };
                const isBusy = actionLoading === user._id;

                return (
                  <tr
                    key={user._id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      background: "#fff",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    <td style={{ padding: "16px 20px", fontWeight: 600, color: "#1e293b" }}>{user.name || "N/A"}</td>
                    <td style={{ padding: "16px 20px", color: "#475569" }}>{user.email}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", color: "#64748b" }}>{formatDate(user.createdAt)}</td>
                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                      <button
                        onClick={() => handleDelete(user._id, user.name || user.email)}
                        disabled={isBusy}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid #dc2626",
                          background: "transparent",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#dc2626";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#dc2626";
                        }}
                      >
                        {isBusy ? "Deleting..." : "🗑️ Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
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
    </div>
  );
}
