import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";

const District = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState("");
  const [newDistrictState, setNewDistrictState] = useState("");
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [viewingDistrict, setViewingDistrict] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get(`${URL}/api/getAllState`);
        const stateList = res.data?.result;
        setStates(stateList);
        if (stateList.length > 0) {
          setSelectedState(stateList[0]._id); //this is also use to get select the default state
          setNewDistrictState(stateList[0]._id);//this is use for user experience if user want to add new district then it will automatically select first state in the list
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchStates();
  }, []);

  const fetchDistricts = async () => {
    if (!selectedState) return;

    try {
      const res = await axios.get(
        `${URL}/api/getDistrictByState/${selectedState}`,
      );
    
      setDistricts(res.data.result );
    } catch (err) {
      console.log(err);
      setDistricts([]);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, [selectedState]);

  const softDeleteDistrict = async (id) => {
    try {
      const result = await axios.patch(`${URL}/api/softDeleteDistrict/${id}`);
      fetchDistricts();
    } catch (err) {
      console.log(err);
      alert("Failed to soft delete district");
    }
  };

  const restoreDistrict = async (id) => {
    try {
      const res = await axios.patch(`${URL}/api/restoreDistrict/${id}`);
      fetchDistricts();
    } catch (err) {
      console.log(err);
      alert("Failed to restore district");
    }
  };

  const permanentDeleteDistrict = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this district?")) return;
    try {
      await axios.delete(`${URL}/api/deleteDistrict/${id}`);
      fetchDistricts();
    } catch (err) {
      console.log(err);
      alert("Failed to permanently delete district");
    }
  };

  const addDistrict = async (e) => {
    e.preventDefault();
    if (!newDistrictName.trim() || !newDistrictState) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${URL}/api/createDistrict`, {
        districtname: newDistrictName.trim(),
        stateId: newDistrictState,
      });
      setNewDistrictName("");
      setShowAddModal(false);
      fetchDistricts();
    } catch (err) {
      console.log(err);
      alert("Failed to add district");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setEditingDistrict(item);
    setNewDistrictName(item.districtname || "");
    setNewDistrictState(item.stateId?._id || selectedState);
    setShowEditModal(true);
  };

  const openViewModal = (item) => {
    setViewingDistrict(item);
    setShowViewModal(true);
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

  const updateDistrict = async (e) => {
    e.preventDefault();
    if (!newDistrictName || !newDistrictState) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await axios.patch(`${URL}/api/updateDistrict/${editingDistrict._id}`, {
        districtname: newDistrictName,
        stateId: newDistrictState,
      });
      setNewDistrictName("");
      setEditingDistrict(null);
      setShowEditModal(false);
      fetchDistricts();
    } catch (err) {
      console.log(err);
      alert("Failed to update district");
    } finally {
      setLoading(false);
    }
  };

  const filteredDistricts = districts.filter((item) => {
    const name = item.districtname || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      tab === "active" ? item.status === "active" : item.status === "inactive";
    return matchesSearch && matchesTab;
  });

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>District Master</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
            Manage district records from one place.
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
          }}
        >
          + Add District
        </button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>
          Select State
        </label>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          style={{ padding: "10px", width: "220px", borderRadius: "8px" }}
        >
          {states.map((state) => (
            <option key={state._id} value={state._id}>
              {state.Statename}
            </option>
          ))}
        </select>
      </div>

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

      <input
        type="text"
        placeholder="Search District"
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

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>
              District Name
            </th>
            <th style={{ padding: "10px", textAlign: "left" }}>State</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredDistricts.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                No {tab} districts found.
              </td>
            </tr>
          ) : (
            filteredDistricts.map((item, index) => {
              const districtName = item.districtname || "";
              const stateName = item.stateId?.Statename || states.find((s) => s._id === selectedState)?.Statename || "";

              return (
                <tr
                  key={item._id || index}
                  style={{ borderTop: "1px solid #e2e8f0" }}
                >
                  <td style={{ padding: "10px" }}>{districtName}</td>
                  <td style={{ padding: "10px" }}>{stateName}</td>
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
                          onClick={() => softDeleteDistrict(item._id)}
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
                          onClick={() => restoreDistrict(item._id)}
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
                          onClick={() => permanentDeleteDistrict(item._id)}
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
              );
            })
          )}
        </tbody>
      </table>

      {/* View District Modal */}
      {showViewModal && viewingDistrict && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, width: "380px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>🏙️ District Details</h3>
              <button
                onClick={() => { setShowViewModal(false); setViewingDistrict(null); }}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* District Name */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", letterSpacing: "0.05em" }}>District Name</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>{viewingDistrict.districtname || "—"}</div>
              </div>

              {/* State */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", letterSpacing: "0.05em" }}>State</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>
                  {viewingDistrict.stateId?.Statename || states.find((s) => s._id === selectedState)?.Statename || "—"}
                </div>
              </div>

              {/* Status */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", letterSpacing: "0.05em" }}>Status</div>
                <span style={{
                  display: "inline-block",
                  padding: "3px 12px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: "600",
                  background: viewingDistrict.status === "active" ? "#dcfce7" : "#fee2e2",
                  color: viewingDistrict.status === "active" ? "#16a34a" : "#dc2626",
                }}>
                  {viewingDistrict.status === "active" ? "✅ Active" : "🚫 Inactive"}
                </span>
              </div>

              {/* Created At */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", letterSpacing: "0.05em" }}>Created At</div>
                <div style={{ fontSize: "14px", color: "#334155" }}>📅 {formatDate(viewingDistrict.createdAt)}</div>
              </div>

              {/* Last Updated */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", letterSpacing: "0.05em" }}>Last Updated</div>
                <div style={{ fontSize: "14px", color: "#334155" }}>🕒 {formatDate(viewingDistrict.updatedAt)}</div>
              </div>
            </div>

            <button
              onClick={() => { setShowViewModal(false); setViewingDistrict(null); }}
              style={{ marginTop: "20px", width: "100%", padding: "10px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add District Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ marginTop: 0 }}>Add District</h3>
            <form onSubmit={addDistrict}>
              <label style={{ display: "block", marginBottom: "6px" }}>District Name</label>
              <input
                type="text"
                placeholder="Enter district name"
                value={newDistrictName}
                onChange={(e) => setNewDistrictName(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
              <label style={{ display: "block", marginBottom: "6px" }}>Select State</label>
              <select
                value={newDistrictState}
                onChange={(e) => setNewDistrictState(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              >
                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.Statename}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setNewDistrictName(""); }}
                  style={{ flex: 1, padding: "10px", background: "#e2e8f0", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit District Modal */}
      {showEditModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ marginTop: 0 }}>Edit District</h3>
            <form onSubmit={updateDistrict}>
              <label style={{ display: "block", marginBottom: "6px" }}>District Name</label>
              <input
                type="text"
                placeholder="Enter district name"
                value={newDistrictName}
                onChange={(e) => setNewDistrictName(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
              <label style={{ display: "block", marginBottom: "6px" }}>Select State</label>
              <select
                value={newDistrictState}
                onChange={(e) => setNewDistrictState(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              >
                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.Statename}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  {loading ? "Saving..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingDistrict(null); setNewDistrictName(""); }}
                  style={{ flex: 1, padding: "10px", background: "#e2e8f0", border: "none", borderRadius: "6px", cursor: "pointer" }}
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

export default District;
