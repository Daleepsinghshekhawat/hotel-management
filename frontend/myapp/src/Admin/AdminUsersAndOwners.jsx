import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";

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
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // For "all", fetch "all" and filter admin/superadmin client-side
      const res = await axios.get(`${URL}/api/getUsersByRole/${roleFilter}`);
      setUsers(res.data.result || []);
    } catch (err) {
      console.log("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

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

  // Filter out any admin or superadmin accounts just in case, and match search query
  const filteredUsers = users.filter(
    (u) =>
      u.role !== "admin" &&
      u.role !== "superadmin" &&
      ((u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(search.toLowerCase()))
  );

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
          👥 Registered Accounts
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          View and manage user accounts and hotel owners registered on the platform.
        </p>
      </div>

      {/* Role Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {ROLE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setRoleFilter(tab)}
            style={{
              border: "none",
              padding: "10px 20px",
              borderRadius: "999px",
              background: roleFilter === tab ? "#2563eb" : "#e2e8f0",
              color: roleFilter === tab ? "#fff" : "#475569",
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

      {/* Search Input */}
      <input
        type="text"
        placeholder="🔍 Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 16px",
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
          ⏳ Loading accounts...
        </div>
      ) : filteredUsers.length === 0 ? (
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
          <div style={{ fontSize: "48px", marginBottom: "14px" }}>👥</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No accounts found matching search.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "14px",
            }}
          >
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
              {filteredUsers.map((user) => {
                const badge = ROLE_BADGES[user.role] || { bg: "#f1f5f9", color: "#475569", label: user.role };
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
        </div>
      )}
    </div>
  );
}
