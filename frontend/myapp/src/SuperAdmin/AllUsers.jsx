import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/getUsersByRole/user`);
      setUsers(res.data.result || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account "${name}"?`)) return;
    setActionLoading(id);
    try {
      await axios.delete(`${URL}/api/deleteUser/${id}`);
      alert("User deleted successfully.");
      fetchUsers();
    } catch (err) {
      alert("Error deleting user account.");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
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
          👤 Registered Platform Users
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          View and manage customer/user accounts registered on the platform.
        </p>
      </div>

      <input
        type="text"
        placeholder="🔍 Search users by name or email..."
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
          ⏳ Loading users list...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          No user accounts found.
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
                    <span style={{
                      background: "#e0f2fe",
                      color: "#0369a1",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}>
                      User
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#64748b" }}>{formatDate(user.createdAt)}</td>
                  <td style={{ padding: "16px 20px", textAlign: "center" }}>
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
                      {actionLoading === user._id ? "Deleting..." : "🗑️ Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
