import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";
import useDebounce from "../hooks/useDebounce";
import { useOutletContext } from "react-router-dom";

const District = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [tab, setTab] = useState("active");
  const { theme } = useOutletContext() || { theme: "light" };
  const isDark = theme !== "dark";

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState("");
  const [newDistrictState, setNewDistrictState] = useState("");
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${URL}/api/getAllState`, { headers: { Authorization: `Bearer ${token}` } });
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
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${URL}/api/getDistrictByState/${selectedState}`, { params: { search: debouncedSearch }, headers: { Authorization: `Bearer ${token}` } }
      );
    
      setDistricts(res.data.result );
    } catch (err) {
      console.log(err);
      setDistricts([]);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, [selectedState, debouncedSearch]);

  const totalCount = districts.length;
  const activeCount = districts.filter((d) => d.status === "active").length;
  const inactiveCount = districts.filter((d) => d.status === "inactive").length;

  const softDeleteDistrict = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const result = await axios.patch(`${URL}/api/softDeleteDistrict/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchDistricts();
    } catch (err) {
      console.log(err);
      alert("Failed to soft delete district");
    }
  };

  const restoreDistrict = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`${URL}/api/restoreDistrict/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchDistricts();
    } catch (err) {
      console.log(err);
      alert("Failed to restore district");
    }
  };

  const permanentDeleteDistrict = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this district?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${URL}/api/deleteDistrict/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
      const token = localStorage.getItem('token');
      await axios.post(`${URL}/api/createDistrict`, {
        districtname: newDistrictName.trim(),
        stateId: newDistrictState,
      }, { headers: { Authorization: `Bearer ${token}` } });
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

  const updateDistrict = async (e) => {
    e.preventDefault();
    if (!newDistrictName || !newDistrictState) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${URL}/api/updateDistrict/${editingDistrict._id}`, {
        districtname: newDistrictName,
        stateId: newDistrictState,
      }, { headers: { Authorization: `Bearer ${token}` } });
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
    const matchesTab =
      tab === "active" ? item.status === "active" : item.status === "inactive";
    return matchesTab;
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
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: isDark ? "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)" : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", padding: "24px", borderRadius: "16px", border: isDark ? "1px solid #1e40af" : "1px solid #bfdbfe", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", transition: "transform 0.2s", cursor: "default" }} onMouseEnter={(e) => e.currentTarget.style.transform="translateY(-4px)"} onMouseLeave={(e) => e.currentTarget.style.transform="translateY(0)"}>
          <h3 style={{ margin: "0 0 10px 0", color: isDark ? "#93c5fd" : "#1e3a8a", fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>📍 Total Districts</h3>
          <p style={{ margin: 0, fontSize: "36px", fontWeight: 700, color: isDark ? "#eff6ff" : "#1d4ed8" }}>{totalCount}</p>
        </div>
        <div style={{ background: isDark ? "linear-gradient(135deg, #14532d 0%, #064e3b 100%)" : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", padding: "24px", borderRadius: "16px", border: isDark ? "1px solid #166534" : "1px solid #bbf7d0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", transition: "transform 0.2s", cursor: "default" }} onMouseEnter={(e) => e.currentTarget.style.transform="translateY(-4px)"} onMouseLeave={(e) => e.currentTarget.style.transform="translateY(0)"}>
          <h3 style={{ margin: "0 0 10px 0", color: isDark ? "#86efac" : "#14532d", fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>✅ Active Districts</h3>
          <p style={{ margin: 0, fontSize: "36px", fontWeight: 700, color: isDark ? "#f0fdf4" : "#15803d" }}>{activeCount}</p>
        </div>
        <div style={{ background: isDark ? "linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)" : "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)", padding: "24px", borderRadius: "16px", border: isDark ? "1px solid #991b1b" : "1px solid #fecaca", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", transition: "transform 0.2s", cursor: "default" }} onMouseEnter={(e) => e.currentTarget.style.transform="translateY(-4px)"} onMouseLeave={(e) => e.currentTarget.style.transform="translateY(0)"}>
          <h3 style={{ margin: "0 0 10px 0", color: isDark ? "#fca5a5" : "#7f1d1d", fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>🚫 Inactive Districts</h3>
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
          <h2 style={{ margin: 0, color: isDark ? "#f8fafc" : "#0f172a" }}>District</h2>
          <p style={{ margin: "6px 0 0", color: isDark ? "#94a3b8" : "#64748b" }}>
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
        <label style={{ display: "block", marginBottom: "6px", color: isDark ? "#cbd5e1" : "#0f172a" }}>
          Select State
        </label>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          style={{ padding: "10px", width: "220px", borderRadius: "8px", background: isDark ? "#0f172a" : "#fff", color: isDark ? "#f8fafc" : "#0f172a", border: isDark ? "1px solid #475569" : "1px solid #cbd5e1" }}
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

      <input
        type="text"
        placeholder="Search District"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "8px",
          border: isDark ? "1px solid #475569" : "1px solid #cbd5e1",
          background: isDark ? "#0f172a" : "#fff",
          color: isDark ? "#f8fafc" : "#0f172a",
          marginBottom: "16px",
          boxSizing: "border-box",
        }}
      />

      <div style={{ overflowX: "auto", borderRadius: "12px", border: isDark ? "1px solid #334155" : "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "15px" }}>
          <thead>
            <tr style={{ background: isDark ? "#334155" : "#f8fafc", borderBottom: isDark ? "2px solid #475569" : "2px solid #e2e8f0" }}>
              <th style={{ padding: "16px", textAlign: "left", color: isDark ? "#e2e8f0" : "#475569", fontWeight: 600 }}>District Name</th>
              <th style={{ padding: "16px", textAlign: "left", color: isDark ? "#e2e8f0" : "#475569", fontWeight: 600 }}>State</th>
              <th style={{ padding: "16px", textAlign: "left", color: isDark ? "#e2e8f0" : "#475569", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "16px", textAlign: "left", color: isDark ? "#e2e8f0" : "#475569", fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDistricts.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "20px", textAlign: "center", color: isDark ? "#64748b" : "#94a3b8" }}>
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
                    style={{ borderTop: isDark ? "1px solid #475569" : "1px solid #e2e8f0", color: isDark ? "#f8fafc" : "#0f172a" }}
                  >
                    <td style={{ padding: "16px" }}>{districtName}</td>
                    <td style={{ padding: "16px" }}>{stateName}</td>
                    <td style={{ padding: "16px" }}>{item.status || "active"}</td>
                    <td style={{ padding: "16px" }}>
                      {tab === "active" ? (
                        <>
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
      </div>
    </div>

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
