import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";

const STATUS_TABS = ["all", "pending", "approved", "rejected"];

const STATUS_CONFIG = {
  pending: { bg: "#fef9c3", color: "#854d0e", label: "Pending" },
  approved: { bg: "#dcfce7", color: "#166534", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
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
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [hotels, setHotels] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewingHotel, setViewingHotel] = useState(null);

  const fetchHotels = async () => {
    if (!user.email) return;
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/getHotelRequestsByAdmin/${user.email}`);
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
  }, [user.email]);

  const tabFiltered =
    tab === "all" ? hotels : hotels.filter((h) => h.status === tab);

  const filtered = tabFiltered.filter(
    (h) =>
      (h.hotelName || "").toLowerCase().includes(search.toLowerCase()) ||
      (h.ownerName || "").toLowerCase().includes(search.toLowerCase()) ||
      formatLocation(h.location).toLowerCase().includes(search.toLowerCase())
  );

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
                  {item.image ? (
                    <img
                      src={item.image}
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

                  <button
                    onClick={() => setViewingHotel(item)}
                    style={{
                      width: "100%",
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewingHotel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setViewingHotel(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px" }}>{viewingHotel.hotelName}</h2>
            {viewingHotel.image && (
              <img
                src={viewingHotel.image}
                alt={viewingHotel.hotelName}
                style={{
                  width: "100%",
                  maxHeight: "220px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginBottom: "16px",
                }}
              />
            )}
            <p><strong>Owner:</strong> {viewingHotel.ownerName}</p>
            <p><strong>Email:</strong> {viewingHotel.email}</p>
            <p><strong>Location:</strong> {formatLocation(viewingHotel.location)}</p>
            <p><strong>Status:</strong> {viewingHotel.status}</p>
            <p><strong>Registration ID:</strong> {viewingHotel.registrationId}</p>
            <p><strong>Description:</strong> {viewingHotel.description}</p>
            {viewingHotel.rejectionReason && (
              <p><strong>Rejection Reason:</strong> {viewingHotel.rejectionReason}</p>
            )}
            <button
              onClick={() => setViewingHotel(null)}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "11px",
                border: "none",
                borderRadius: "10px",
                background: "#e2e8f0",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
