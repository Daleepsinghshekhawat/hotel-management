import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";

const City = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const [newCityDistrict, setNewCityDistrict] = useState("");
  const [editingCity, setEditingCity] = useState(null);
  const [viewingCity, setViewingCity] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load all states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get(`${URL}/api/getAllState`);
        const stateList = res.data?.result || [];
        setStates(stateList);
        if (stateList.length > 0) setSelectedState(stateList[0]._id);
      } catch (err) {
        console.log(err);
      }
    };
    fetchStates();
  }, []);

  // Load districts when state changes
  useEffect(() => {
    if (!selectedState) return;
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${URL}/api/getDistrictByState/${selectedState}`);
        const list = res.data?.result || [];
        const activeOnly = list.filter((d) => d.status === "active");
        setDistricts(activeOnly);
        if (activeOnly.length > 0) {
          setSelectedDistrict(activeOnly[0]._id);
          setNewCityDistrict(activeOnly[0]._id);
        } else {
          setSelectedDistrict("");
          setNewCityDistrict("");
        }
      } catch (err) {
        console.log(err);
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  // Load cities when district changes
  const fetchCities = async () => {
    if (!selectedDistrict) { setCities([]); return; }
    try {
      const res = await axios.get(`${URL}/api/getCityByDistrict/${selectedDistrict}`);
      const list = Array.isArray(res.data?.result) ? res.data.result : [];
      setCities(list);
    } catch (err) {
      console.log(err);
      setCities([]);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [selectedDistrict]);

  const softDeleteCity = async (id) => {
    try {
      await axios.patch(`${URL}/api/softDeleteCity/${id}`);
      fetchCities();
    } catch (err) {
      console.log(err);
      alert("Failed to soft delete city");
    }
  };

  const restoreCity = async (id) => {
    try {
      await axios.patch(`${URL}/api/restoreCity/${id}`);
      fetchCities();
    } catch (err) {
      console.log(err);
      alert("Failed to restore city");
    }
  };

  const permanentDeleteCity = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this city?")) return;
    try {
      await axios.delete(`${URL}/api/deleteCity/${id}`);
      fetchCities();
    } catch (err) {
      console.log(err);
      alert("Failed to permanently delete city");
    }
  };

  const addCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim() || !newCityDistrict) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${URL}/api/createCity`, {
        cityname: newCityName.trim(),
          state: selectedState,
        district: newCityDistrict,
      });
      setNewCityName("");
      setShowAddModal(false);
      fetchCities();
    } catch (err) {
      console.log(err);
      alert("Failed to add city");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setEditingCity(item);
    setNewCityName(item.cityname || "");
    setNewCityDistrict(item.district?._id || selectedDistrict);
    setShowEditModal(true);
  };

  const openViewModal = (item) => {
    setViewingCity(item);
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

  const updateCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim() || !newCityDistrict) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await axios.patch(`${URL}/api/updateCity/${editingCity._id}`, {
        cityname: newCityName.trim(),
        district: newCityDistrict,
      });
      setNewCityName("");
      setEditingCity(null);
      setShowEditModal(false);
      fetchCities();
    } catch (err) {
      console.log(err);
      alert("Failed to update city");
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter((item) => {
    const name = item.cityname || "";
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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0 }}>City Master</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>Manage city records from one place.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ border: "none", padding: "10px 14px", borderRadius: "8px", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: "600" }}
        >
          + Add City
        </button>
      </div>

      {/* Filters: State + District */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Select State</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            style={{ padding: "10px", width: "180px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
          >
            {states.map((state) => (
              <option key={state._id} value={state._id}>{state.Statename}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>Select District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{ padding: "10px", width: "180px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
          >
            {districts.length === 0 && <option value="">No districts</option>}
            {districts.map((d) => (
              <option key={d._id} value={d._id}>{d.districtname}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active / Inactive tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={() => setTab("active")}
          style={{ border: "none", padding: "8px 12px", borderRadius: "8px", background: tab === "active" ? "#2563eb" : "#e2e8f0", color: tab === "active" ? "#fff" : "#0f172a", cursor: "pointer" }}
        >
          Active
        </button>
        <button
          onClick={() => setTab("inactive")}
          style={{ border: "none", padding: "8px 12px", borderRadius: "8px", background: tab === "inactive" ? "#2563eb" : "#e2e8f0", color: tab === "inactive" ? "#fff" : "#0f172a", cursor: "pointer" }}
        >
          Inactive
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search City"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "16px", boxSizing: "border-box" }}
      />

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>City Name</th>
            <th style={{ padding: "10px", textAlign: "left" }}>District</th>
            <th style={{ padding: "10px", textAlign: "left" }}>State</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCities.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>
                No {tab} cities found.
              </td>
            </tr>
          ) : (
            filteredCities.map((item, index) => (
              <tr key={item._id || index} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px" }}>{item.cityname || ""}</td>
                <td style={{ padding: "10px" }}>{item.district?.districtname || ""}</td>
                <td style={{ padding: "10px" }}>{item.district?.stateId?.Statename || ""}</td>
                <td style={{ padding: "10px" }}>{item.status || "active"}</td>
                <td style={{ padding: "10px" }}>
                  {tab === "active" ? (
                    <>
                      <button
                        onClick={() => openViewModal(item)}
                        style={{ border: "none", padding: "6px 12px", borderRadius: "6px", background: "#0ea5e9", color: "#fff", cursor: "pointer", fontWeight: "600", marginRight: "6px" }}
                      >
                        👁 View
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        style={{ border: "none", padding: "6px 14px", borderRadius: "6px", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: "600", marginRight: "6px" }}
                      >
                        ✏️ Update
                      </button>
                      <button
                        onClick={() => softDeleteCity(item._id)}
                        style={{ border: "none", padding: "6px 10px", borderRadius: "6px", background: "#e2e8f0", cursor: "pointer" }}
                      >
                        Soft Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openViewModal(item)}
                        style={{ border: "none", padding: "6px 12px", borderRadius: "6px", background: "#0ea5e9", color: "#fff", cursor: "pointer", fontWeight: "600", marginRight: "6px" }}
                      >
                        👁 View
                      </button>
                      <button
                        onClick={() => restoreCity(item._id)}
                        style={{ border: "none", padding: "6px 10px", borderRadius: "6px", background: "#e2e8f0", cursor: "pointer", marginRight: "6px" }}
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => permanentDeleteCity(item._id)}
                        style={{ border: "none", padding: "6px 10px", borderRadius: "6px", background: "#fee2e2", cursor: "pointer" }}
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

      {/* ── View City Modal ── */}
      {showViewModal && viewingCity && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, width: "380px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>🏙️ City Details</h3>
              <button
                onClick={() => { setShowViewModal(false); setViewingCity(null); }}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* City Name */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", letterSpacing: "0.05em" }}>City Name</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>{viewingCity.cityname || "—"}</div>
              </div>

              {/* District */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", letterSpacing: "0.05em" }}>District</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>{viewingCity.district?.districtname || "—"}</div>
              </div>

              {/* State */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", letterSpacing: "0.05em" }}>State</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>{viewingCity.district?.stateId?.Statename || "—"}</div>
              </div>

              {/* Status */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", letterSpacing: "0.05em" }}>Status</div>
                <span style={{
                  display: "inline-block", padding: "3px 12px", borderRadius: "999px", fontSize: "13px", fontWeight: "600",
                  background: viewingCity.status === "active" ? "#dcfce7" : "#fee2e2",
                  color: viewingCity.status === "active" ? "#16a34a" : "#dc2626",
                }}>
                  {viewingCity.status === "active" ? "✅ Active" : "🚫 Inactive"}
                </span>
              </div>

              {/* Created At */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", letterSpacing: "0.05em" }}>Created At</div>
                <div style={{ fontSize: "14px", color: "#334155" }}>📅 {formatDate(viewingCity.createdAt)}</div>
              </div>

              {/* Last Updated */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "600", marginBottom: "4px", letterSpacing: "0.05em" }}>Last Updated</div>
                <div style={{ fontSize: "14px", color: "#334155" }}>🕒 {formatDate(viewingCity.updatedAt)}</div>
              </div>
            </div>

            <button
              onClick={() => { setShowViewModal(false); setViewingCity(null); }}
              style={{ marginTop: "20px", width: "100%", padding: "10px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Add City Modal ── */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ marginTop: 0 }}>Add City</h3>
            <form onSubmit={addCity}>
              <label style={{ display: "block", marginBottom: "6px" }}>City Name</label>
              <input
                type="text"
                placeholder="Enter city name"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
              <label style={{ display: "block", marginBottom: "6px" }}>Select District</label>
              <select
                value={newCityDistrict}
                onChange={(e) => setNewCityDistrict(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              >
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>{d.districtname}</option>
                ))}
              </select>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" disabled={loading}
                  style={{ flex: 1, padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setNewCityName(""); }}
                  style={{ flex: 1, padding: "10px", background: "#e2e8f0", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit City Modal ── */}
      {showEditModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ marginTop: 0 }}>Edit City</h3>
            <form onSubmit={updateCity}>
              <label style={{ display: "block", marginBottom: "6px" }}>City Name</label>
              <input
                type="text"
                placeholder="Enter city name"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
              <label style={{ display: "block", marginBottom: "6px" }}>Select District</label>
              <select
                value={newCityDistrict}
                onChange={(e) => setNewCityDistrict(e.target.value)}
                style={{ width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              >
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>{d.districtname}</option>
                ))}
              </select>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" disabled={loading}
                  style={{ flex: 1, padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                >
                  {loading ? "Saving..." : "Update"}
                </button>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingCity(null); setNewCityName(""); }}
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

export default City;
