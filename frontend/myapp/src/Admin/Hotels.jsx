import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import URL from "../api";
import useDebounce from "../hooks/useDebounce";

const STATUS_TABS = ["all", "pending", "approved", "rejected", "deleted"];

const STATUS_CONFIG = {
  pending: { bg: "#fef9c3", color: "#854d0e", label: "Pending" },
  approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
  inactive: { bg: "#f1f5f9", color: "#475569", label: "Deleted" },
};

const formatLocation = (location) => {
  if (!location) return "N/A";
  if (typeof location === "string") return location;
  const city = location.cityname || "";
  const district = location.district?.districtname || "";
  const state = location.state?.Statename || "";
  return [city, district, state].filter(Boolean).join(", ") || "N/A";
};

export default function Hotels() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [hotels, setHotels] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);

  const fetchHotels = async () => {
    if (!user.email) return;
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/getRequestsByAdmin/${user.email}`, {
        params: { search: debouncedSearch }
      });
      setHotels(res.data.result || []);
    } catch (err) {
      console.log(err);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [user.email, debouncedSearch]);

  const tabFiltered =
    tab === "all"
      ? hotels.filter((h) => h.status !== "inactive")
      : tab === "deleted"
      ? hotels.filter((h) => h.status === "inactive")
      : hotels.filter((h) => h.status === tab);

  const handleDeleteHotel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;
    try {
      const res = await axios.patch(`${URL}/api/softDeleteHotel/${id}`);
      if (res.data.success) {
        alert("Hotel deleted successfully");
        fetchHotels();
      } else {
        alert(res.data.message || "Failed to delete hotel");
      }
    } catch (err) {
      console.log(err);
      alert("Error deleting hotel");
    }
  };

  const filtered = tabFiltered;


  const counts = {
    pending: hotels.filter((h) => h.status === "pending").length,
    approved: hotels.filter((h) => h.status === "approved").length,
    rejected: hotels.filter((h) => h.status === "rejected").length,
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

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          My Hotels
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Track pending, approved, and rejected hotel submissions.
        </p>
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
            {t === "all" ? "All" : t}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search by hotel name, owner, or location..."
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
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>Loading hotels...</div>
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
          <div style={{ fontSize: "48px", marginBottom: "14px" }}>🏨</div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: "16px" }}>No hotels found.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {filtered.map((item) => {
            const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
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
                <div style={{ position: "relative", height: "170px", background: "#0f172a" }}>
                  {item.images?.[0] ? (
                    <img
                      src={item.images?.[0]}
                      alt={item.hotelName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        fontSize: "50px",
                        opacity: 0.4,
                      }}
                    >
                      🏨
                    </div>
                  )}
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
                </div>

                <div style={{ padding: "18px 20px" }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: "17px", color: "#0f172a" }}>
                    {item.hotelName}
                  </h3>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#64748b" }}>
                    {formatLocation(item.location)}
                  </p>
                  <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#64748b" }}>
                    {item.ownerName} · {item.email}
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
                      <strong>Reason:</strong> {item.rejectionReason}
                    </div>
                  )}

                  <p style={{ margin: "0 0 12px", fontSize: "11px", color: "#94a3b8" }}>
                    Submitted: {formatDate(item.createdAt)}
                  </p>

                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button
                      onClick={() => {
                        const prefix = window.location.pathname.startsWith("/hotel") ? "/hotel" : "/adminpage";
                        navigate(`${prefix}/hotel-detail/${item._id}`);
                      }}
                      style={{
                        flex: 1,
                        padding: "9px 0",
                        borderRadius: "9px",
                        border: "1px solid #2563eb",
                        background: "transparent",
                        color: "#2563eb",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      View Details
                    </button>
                    {item.status === "approved" ? (
                      <button
                        onClick={() => {
                          const prefix = window.location.pathname.startsWith("/hotel") ? "/hotel" : "/adminpage";
                          navigate(`${prefix}/add-room?hotelId=${item._id}`);
                        }}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          borderRadius: "9px",
                          border: "none",
                          background: "#2563eb",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        Add Room
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          borderRadius: "9px",
                          border: "none",
                          background: "#e2e8f0",
                          color: "#94a3b8",
                          cursor: "not-allowed",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                        title="You can only add rooms to approved hotels"
                      >
                        Add Room
                      </button>
                    )}
                  </div>
                  {item.status !== "inactive" && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button
                        onClick={() => {
                          const prefix = window.location.pathname.startsWith("/hotel") ? "/hotel" : "/adminpage";
                          navigate(`${prefix}/hotels/edit/${item._id}`);
                        }}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          borderRadius: "9px",
                          border: "1px solid #d97706",
                          background: "transparent",
                          color: "#d97706",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "13px",
                          transition: "all 0.2s"
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHotel(item._id)}
                        style={{
                          flex: 1,
                          padding: "9px 0",
                          borderRadius: "9px",
                          border: "none",
                          background: "#fee2e2",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "13px",
                          transition: "all 0.2s"
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
