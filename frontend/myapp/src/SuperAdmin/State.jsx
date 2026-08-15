import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";
import useDebounce from "../hooks/useDebounce";
import { useOutletContext } from "react-router-dom";

const State = () => {
  const { theme } = useOutletContext() || { theme: "light" };
  const isDark = theme !== "dark";

  const [states, setStates] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [tab, setTab] = useState("active");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);

  const totalCount = states.length;
  const activeCount = states.filter((s) => s.status === "active").length;
  const inactiveCount = states.filter((s) => s.status === "inactive").length;
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [newState, setNewState] = useState("");
  const [editingState, setEditingState] = useState(null);
  const [viewingState, setViewingState] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStates = async () => {
    try {
      const token = localStorage.getItem("token");
      const url =
        tab === "active"
          ? `${URL}/api/getAllState`
          : `${URL}/api/getInactiveState`;
      const res = await axios.get(url, { 
        params: { search: debouncedSearch },
        headers: { Authorization: `Bearer ${token}` }
      });
      setStates(res.data.result || []);
    } catch (err) {
      console.log(err);
      setStates([]);
    }
  };

  useEffect(() => {
    getStates();
  }, [tab, debouncedSearch]);

  const softDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${URL}/api/softDeleteState/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      getStates();
    } catch (err) {
      console.log(err);
      alert("Failed to soft delete state");
    }
  };

  const restore = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${URL}/api/restoreState/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      getStates();
    } catch (err) {
      console.log(err);
      alert("Failed to restore state");
    }
  };

  const permanentDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this state?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${URL}/api/deleteState/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      getStates();
    } catch (err) {
      console.log(err);
      alert("Failed to permanently delete state");
    }
  };

  const addState = async (e) => {
    e.preventDefault();
    if (!newState.trim()) {
      alert("Please enter a state name");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${URL}/api/addState`, { Statename: newState.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewState("");
      setShowAddModal(false);
      getStates();
    } catch (err) {
      console.log(err);
      alert("Failed to add state");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setEditingState(item);
    setNewState(item.Statename || "");
    setShowEditModal(true);
  };

  const openViewModal = (item) => {
    setViewingState(item);
    setShowViewModal(true);
  };

  const updateState = async (e) => {
    e.preventDefault();
    if (!newState.trim()) {
      alert("Please enter a state name");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${URL}/api/updateState/${editingState._id}`, {
        Statename: newState.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewState("");
      setEditingState(null);
      setShowEditModal(false);
      getStates();
    } catch (err) {
      console.log(err);
      alert("Failed to update state");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredStates = states;

  const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalBoxStyle = {
    background: "#fff",
    padding: "24px",
    borderRadius: "10px",
    width: "340px",
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: isDark ? "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)" : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", padding: "24px", borderRadius: "16px", border: isDark ? "1px solid #1e40af" : "1px solid #bfdbfe", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", transition: "transform 0.2s", cursor: "default" }} onMouseEnter={(e) => e.currentTarget.style.transform="translateY(-4px)"} onMouseLeave={(e) => e.currentTarget.style.transform="translateY(0)"}>
          <h3 style={{ margin: "0 0 10px 0", color: isDark ? "#93c5fd" : "#1e3a8a", fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>🗺️ Total States</h3>
          <p style={{ margin: 0, fontSize: "36px", fontWeight: 700, color: isDark ? "#eff6ff" : "#1d4ed8" }}>{totalCount}</p>
        </div>
        <div style={{ background: isDark ? "linear-gradient(135deg, #14532d 0%, #064e3b 100%)" : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", padding: "24px", borderRadius: "16px", border: isDark ? "1px solid #166534" : "1px solid #bbf7d0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", transition: "transform 0.2s", cursor: "default" }} onMouseEnter={(e) => e.currentTarget.style.transform="translateY(-4px)"} onMouseLeave={(e) => e.currentTarget.style.transform="translateY(0)"}>
          <h3 style={{ margin: "0 0 10px 0", color: isDark ? "#86efac" : "#14532d", fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>✅ Active States</h3>
          <p style={{ margin: 0, fontSize: "36px", fontWeight: 700, color: isDark ? "#f0fdf4" : "#15803d" }}>{activeCount}</p>
        </div>
        <div style={{ background: isDark ? "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)" : "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)", padding: "24px", borderRadius: "16px", border: isDark ? "1px solid #991b1b" : "1px solid #fecaca", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", transition: "transform 0.2s", cursor: "default" }} onMouseEnter={(e) => e.currentTarget.style.transform="translateY(-4px)"} onMouseLeave={(e) => e.currentTarget.style.transform="translateY(0)"}>
          <h3 style={{ margin: "0 0 10px 0", color: isDark ? "#fca5a5" : "#7f1d1d", fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>🚫 Inactive States</h3>
          <p style={{ margin: 0, fontSize: "36px", fontWeight: 700, color: isDark ? "#fef2f2" : "#b91c1c" }}>{inactiveCount}</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div style={{ background: isDark ? "#1e293b" : "#fff", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)", border: isDark ? "1px solid #334155" : "1px solid #f1f5f9", padding: "28px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            borderBottom: isDark ? "2px solid #334155" : "2px solid #f8fafc",
            paddingBottom: "20px"
          }}
        >
        <div>
          <h2 style={{ margin: 0, color: isDark ? "#f8fafc" : "#0f172a" }}>State Master</h2>
          <p style={{ margin: "6px 0 0", color: isDark ? "#94a3b8" : "#64748b" }}>
            Manage state records from one place.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            border: "none",
            padding: "10px 14px",
            borderRadius: "8px",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          + Add State
        </button>
      </div>

      {/* Active / Inactive tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={() => setTab("active")}
          style={{
            border: "none",
            padding: "8px 12px",
            borderRadius: "8px",
            background: tab === "active" ? "#2563eb" : (isDark ? "#334155" : "#e2e8f0"),
            color: tab === "active" ? "#fff" : (isDark ? "#cbd5e1" : "#0f172a"),
            cursor: "pointer",
          }}
        >
          Active
        </button>
        <button
          onClick={() => setTab("inactive")}
          style={{
            border: "none",
            padding: "8px 12px",
            borderRadius: "8px",
            background: tab === "inactive" ? "#2563eb" : (isDark ? "#334155" : "#e2e8f0"),
            color: tab === "inactive" ? "#fff" : (isDark ? "#cbd5e1" : "#0f172a"),
            cursor: "pointer",
          }}
        >
          Inactive
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search State"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "8px",
          border: isDark ? "1px solid #475569" : "1px solid #cbd5e1",
          background: isDark ? "#0f172a" : "#fff",
          color: isDark ? "#fff" : "#0f172a",
          marginBottom: "16px",
          boxSizing: "border-box",
        }}
      />

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: "12px", border: isDark ? "1px solid #334155" : "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px" }}>
          <thead>
            <tr style={{ background: isDark ? "#334155" : "#f8fafc", borderBottom: isDark ? "2px solid #475569" : "2px solid #e2e8f0" }}>
              <th style={{ padding: "16px", textAlign: "left", color: isDark ? "#e2e8f0" : "#475569", fontWeight: 600 }}>State Name</th>
              <th style={{ padding: "16px", textAlign: "left", color: isDark ? "#e2e8f0" : "#475569", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "16px", textAlign: "left", color: isDark ? "#e2e8f0" : "#475569", fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
        <tbody>
          {filteredStates.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                style={{ padding: "20px", textAlign: "center", color: isDark ? "#64748b" : "#94a3b8" }}
              >
                No {tab} states found.
              </td>
            </tr>
          ) : (
            filteredStates.map((item, index) => (
              <tr
                key={item._id || index}
                style={{ borderTop: isDark ? "1px solid #334155" : "1px solid #e2e8f0", color: isDark ? "#f8fafc" : "#0f172a" }}
              >
                <td style={{ padding: "16px" }}>{item.Statename || ""}</td>
                <td style={{ padding: "16px" }}>{item.status || "active"}</td>
                <td style={{ padding: "16px" }}>
                  {tab === "active" ? (
                    <>
                      <button
                        onClick={() => openViewModal(item)}
                        style={{
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#0ea5e9",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: "600",
                          marginRight: "6px",
                        }}
                      >
                        👁 View
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        style={{
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          background: "#2563eb",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        ✏️ Update
                      </button>
                      <button
                        onClick={() => softDelete(item._id)}
                        style={{
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          background: "#e2e8f0",
                          cursor: "pointer",
                          marginLeft: "8px",
                        }}
                      >
                        Soft Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openViewModal(item)}
                        style={{
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#0ea5e9",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: "600",
                          marginRight: "6px",
                        }}
                      >
                        👁 View
                      </button>
                      <button
                        onClick={() => restore(item._id)}
                        style={{
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          background: "#e2e8f0",
                          cursor: "pointer",
                        }}
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => permanentDelete(item._id)}
                        style={{
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          background: "#fee2e2",
                          cursor: "pointer",
                          marginLeft: "8px",
                        }}
                      >
                        Permanent Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>

      {/* ── View State Modal ── */}
      {showViewModal && viewingState && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, width: "380px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
                🗺️ State Details
              </h3>
              <button
                onClick={() => { setShowViewModal(false); setViewingState(null); }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#64748b",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* State Name */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    fontWeight: "600",
                    marginBottom: "4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  State Name
                </div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>
                  {viewingState.Statename || "—"}
                </div>
              </div>

              {/* Status */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    fontWeight: "600",
                    marginBottom: "4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  Status
                </div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 12px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: "600",
                    background: viewingState.status === "active" ? "#dcfce7" : "#fee2e2",
                    color: viewingState.status === "active" ? "#16a34a" : "#dc2626",
                  }}
                >
                  {viewingState.status === "active" ? "✅ Active" : "🚫 Inactive"}
                </span>
              </div>

              {/* Created At */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    fontWeight: "600",
                    marginBottom: "4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  Created At
                </div>
                <div style={{ fontSize: "14px", color: "#334155" }}>
                  📅 {formatDate(viewingState.createdAt)}
                </div>
              </div>

              {/* Last Updated */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    fontWeight: "600",
                    marginBottom: "4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  Last Updated
                </div>
                <div style={{ fontSize: "14px", color: "#334155" }}>
                  🕒 {formatDate(viewingState.updatedAt)}
                </div>
              </div>
            </div>

            <button
              onClick={() => { setShowViewModal(false); setViewingState(null); }}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "10px",
                background: "#0ea5e9",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Add State Modal ── */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ marginTop: 0 }}>Add State</h3>
            <form onSubmit={addState}>
              <label style={{ display: "block", marginBottom: "6px" }}>State Name</label>
              <input
                type="text"
                placeholder="Enter state name"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "16px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setNewState(""); }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#e2e8f0",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit State Modal ── */}
      {showEditModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ marginTop: 0 }}>Edit State</h3>
            <form onSubmit={updateState}>
              <label style={{ display: "block", marginBottom: "6px" }}>State Name</label>
              <input
                type="text"
                placeholder="Enter state name"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "16px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {loading ? "Saving..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingState(null); setNewState(""); }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#e2e8f0",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default State;
