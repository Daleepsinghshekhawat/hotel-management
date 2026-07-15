import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";

const State = () => {
  const [states, setStates] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [newState, setNewState] = useState("");
  const [editingState, setEditingState] = useState(null);
  const [viewingState, setViewingState] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStates = async () => {
    try {
      const url =
        tab === "active"
          ? `${URL}/api/getAllState`
          : `${URL}/api/getInactiveState`;
      const res = await axios.get(url);
      setStates(res.data.result || []);
    } catch (err) {
      console.log(err);
      setStates([]);
    }
  };

  useEffect(() => {
    getStates();
  }, [tab]);

  const softDelete = async (id) => {
    try {
      await axios.patch(`${URL}/api/softDeleteState/${id}`);
      getStates();
    } catch (err) {
      console.log(err);
      alert("Failed to soft delete state");
    }
  };

  const restore = async (id) => {
    try {
      await axios.patch(`${URL}/api/restoreState/${id}`);
      getStates();
    } catch (err) {
      console.log(err);
      alert("Failed to restore state");
    }
  };

  const permanentDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this state?")) return;
    try {
      await axios.delete(`${URL}/api/deleteState/${id}`);
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
      await axios.post(`${URL}/api/addState`, { Statename: newState.trim() });
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
      await axios.patch(`${URL}/api/updateState/${editingState._id}`, {
        Statename: newState.trim(),
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

  const filteredStates = states.filter((item) =>
    (item.Statename || "").toLowerCase().includes(search.toLowerCase())
  );

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
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>State Master</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
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
            background: tab === "active" ? "#2563eb" : "#e2e8f0",
            color: tab === "active" ? "#fff" : "#0f172a",
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
            background: tab === "inactive" ? "#2563eb" : "#e2e8f0",
            color: tab === "inactive" ? "#fff" : "#0f172a",
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
          border: "1px solid #cbd5e1",
          marginBottom: "16px",
          boxSizing: "border-box",
        }}
      />

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>State Name</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredStates.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}
              >
                No {tab} states found.
              </td>
            </tr>
          ) : (
            filteredStates.map((item, index) => (
              <tr key={item._id || index} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px" }}>{item.Statename || ""}</td>
                <td style={{ padding: "10px" }}>{item.status || "active"}</td>
                <td style={{ padding: "10px" }}>
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
