import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "../api";
import { Eye, X, MapPin, Phone, Mail, User, Building, BedDouble, CheckCircle } from "lucide-react";

const formatLocation = (location) => {
  if (!location) return "N/A";
  if (typeof location === "string") return location;
  const city = location.cityname || "";
  const district = location.district?.districtname || "";
  const state = location.state?.Statename || "";
  return [city, district, state].filter(Boolean).join(", ") || "N/A";
};

export default function ApprovedHotels() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Modal State
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelRooms, setHotelRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/getHotelsByStatus/active`);
      setHotels(res.data.result || []);
    } catch (err) {
      console.error(err);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel listing? This will remove it permanently.")) return;
    setActionLoading(id);
    try {
      const res = await axios.delete(`${URL}/api/deleteHotel/${id}`);
      if (res.data.success) {
        alert("Hotel deleted successfully.");
        fetchHotels();
      } else {
        alert("Failed to delete hotel.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting hotel.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Are you sure you want to DELETE ALL ${hotels.length} hotels? This cannot be undone.`)) return;
    setActionLoading("all");
    try {
      const res = await axios.delete(`${URL}/api/deleteAllHotels`);
      if (res.data.success) {
        alert("All hotels deleted successfully.");
        fetchHotels();
      } else {
        alert("Failed to delete all hotels.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting all hotels.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleView = async (hotel) => {
    setSelectedHotel(hotel);
    setRoomsLoading(true);
    try {
      const res = await axios.get(`${URL}/api/getRoomsByHotel/${hotel._id}`);
      if (res.data.success) {
        setHotelRooms(res.data.result || []);
      }
    } catch (err) {
      console.error(err);
      setHotelRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  const filtered = hotels.filter(
    (h) =>
      (h.hotelName || "").toLowerCase().includes(search.toLowerCase()) ||
      (h.ownerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (h.email || "").toLowerCase().includes(search.toLowerCase()) ||
      formatLocation(h.location).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "24px", color: "#0f172a", fontWeight: 700 }}>
            Approved Live Hotels
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            View and manage approved active hotel listings on the platform.
          </p>
        </div>
        {hotels.length > 0 && (
          <button
            onClick={handleDeleteAll}
            disabled={actionLoading === "all"}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#dc2626",
              color: "#fff",
              cursor: actionLoading === "all" ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "13px",
              opacity: actionLoading === "all" ? 0.7 : 1,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          >
            {actionLoading === "all" ? "Deleting All..." : `Delete All (${hotels.length})`}
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search approved hotels by name, owner, city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          marginBottom: "24px",
          boxSizing: "border-box",
          fontSize: "14px",
          outline: "none",
          background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          Loading approved listings...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          No approved hotels found.
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#fff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Image</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Hotel Name</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Owner Info</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Location</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600 }}>Registration ID</th>
                <th style={{ padding: "16px 20px", color: "#475569", fontWeight: 600, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hotel) => (
                <tr key={hotel._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 20px" }}>
                    {hotel.image ? (
                      <img 
                        src={hotel.image.startsWith("http") ? hotel.image : `${URL}/${hotel.image.replace(/\\/g, '/')}`} 
                        alt="Hotel" 
                        style={{ width: "60px", height: "45px", objectFit: "cover", borderRadius: "6px" }} 
                      />
                    ) : (
                      <div style={{ width: "60px", height: "45px", background: "#e2e8f0", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#64748b" }}>No Image</div>
                    )}
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 600, color: "#1e293b" }}>{hotel.hotelName}</td>
                  <td style={{ padding: "16px 20px", color: "#475569" }}>
                    <div style={{ fontWeight: 500, color: "#1e293b" }}>{hotel.ownerName}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{hotel.email}</div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#475569" }}>{formatLocation(hotel.location)}</td>
                  <td style={{ padding: "16px 20px", color: "#64748b", fontFamily: "monospace" }}>{hotel.registrationId}</td>
                  <td style={{ padding: "16px 20px", textAlign: "center", display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button
                      title="View Details"
                      onClick={() => handleView(hotel)}
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: "transparent",
                        color: "#3b82f6",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f1f5f9"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/superadmin/hotels/edit/${hotel._id}`)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: "transparent",
                        color: "#d97706",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#fffbeb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(hotel._id)}
                      disabled={actionLoading === hotel._id}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: "transparent",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {actionLoading === hotel._id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODAL OVERLAY */}
      {selectedHotel && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "800px",
            maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            position: "relative"
          }}>
            {/* Modal Header */}
            <div style={{ 
              display: "flex", justifyContent: "space-between", alignItems: "center", 
              padding: "24px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc",
              borderTopLeftRadius: "20px", borderTopRightRadius: "20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {selectedHotel.image ? (
                  <img 
                    src={selectedHotel.image.startsWith("http") ? selectedHotel.image : `${URL}/${selectedHotel.image.replace(/\\/g, '/')}`} 
                    alt="Hotel" 
                    style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px" }} 
                  />
                ) : (
                  <div style={{ width: "48px", height: "48px", background: "#e2e8f0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    <Building size={20} />
                  </div>
                )}
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                    {selectedHotel.hotelName} <CheckCircle size={16} color="#10b981" />
                  </h3>
                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={14} /> {formatLocation(selectedHotel.location)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedHotel(null)}
                style={{
                  background: "#e2e8f0", border: "none", width: "32px", height: "32px",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#475569", flexShrink: 0
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              
              {/* Hotel Overview Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
                
                {/* Contact Box */}
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Contact Info</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>
                    <User size={16} color="#3b82f6" /> {selectedHotel.ownerName}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>
                    <Mail size={16} color="#3b82f6" /> {selectedHotel.email}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#1e293b", fontWeight: 500 }}>
                    <Phone size={16} color="#3b82f6" /> {selectedHotel.phone || "N/A"}
                  </div>
                </div>

                {/* Details Box */}
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>Registration & Status</span>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "#64748b" }}>Reg ID:</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600, fontFamily: "monospace" }}>{selectedHotel.registrationId}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "#64748b" }}>Status:</span>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Active</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "#64748b" }}>Total Rooms:</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>{hotelRooms.length} Added</span>
                  </div>
                </div>

              </div>

              {/* Rooms Section */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
                <BedDouble size={20} color="#0f172a" />
                <h4 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>Hotel Rooms</h4>
              </div>

              {roomsLoading ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>Loading rooms...</div>
              ) : hotelRooms.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", borderRadius: "12px", color: "#64748b" }}>
                  No rooms have been added to this hotel yet.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                  {hotelRooms.map((room) => (
                    <div key={room._id} style={{ 
                      background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                    }}>
                      {/* Room Image */}
                      <div style={{ height: "120px", background: "#f1f5f9", position: "relative" }}>
                        {room.images && room.images[0] ? (
                          <img 
                            src={room.images[0].startsWith("http") ? room.images[0] : `${URL}/${room.images[0].replace(/\\/g, '/')}`} 
                            alt={room.roomName}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                            <BedDouble size={24} />
                          </div>
                        )}
                        <div style={{ 
                          position: "absolute", top: "8px", right: "8px", background: "rgba(255,255,255,0.9)", 
                          padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700, color: "#1e293b" 
                        }}>
                          ₹{room.finalPrice || room.price}
                        </div>
                      </div>
                      
                      {/* Room Info */}
                      <div style={{ padding: "12px" }}>
                        <h5 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {room.roomName}
                        </h5>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                            {room.roomType}
                          </span>
                          <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                            <User size={12} /> {room.maxGuests} max
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
