import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Filter, MapPin, Building, ArrowLeft, Mail, Info } from "lucide-react";
import URL from "../api";

const formatLocation = (location) => {
  if (!location) return "N/A";
  if (typeof location === "string") return location;
  const city = location.cityname || "";
  const district = location.district?.districtname || "";
  const state = location.state?.Statename || "";
  return [city, district, state].filter(Boolean).join(", ") || "N/A";
};

export default function HotelDetailFull() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter/Search States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hotelRes, roomsRes] = await Promise.all([
        axios.get(`${URL}/api/getHotelById/${id}`),
        axios.get(`${URL}/api/getRoomsByHotel/${id}`)
      ]);
      if (hotelRes.data.result) setHotel(hotelRes.data.result);
      if (roomsRes.data.success) setRooms(roomsRes.data.result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const res = await axios.patch(`${URL}/api/updateRoom/${roomId}`, { bookingStatus: newStatus });
      if (res.data.success) {
        setRooms(rooms.map(r => r._id === roomId ? { ...r, bookingStatus: newStatus } : r));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  if (loading) {
    return <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading hotel details...</div>;
  }

  if (!hotel) {
    return <div style={{ padding: "60px", textAlign: "center", color: "#ef4444" }}>Hotel not found.</div>;
  }

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = (r.roomName || "").toLowerCase().includes(search.toLowerCase()) || 
                          (r.roomNumber || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.bookingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontWeight: 600, padding: 0, marginBottom: "20px" }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Hotel Hero Section */}
      <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "32px", display: "flex", flexDirection: "column", md: { flexDirection: "row" } }}>
        <div style={{ height: "300px", position: "relative" }}>
          {hotel.image ? (
            <img src={hotel.image} alt={hotel.hotelName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>🏨</div>
          )}
          <div style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.9)", padding: "6px 14px", borderRadius: "999px", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", color: "#2563eb", backdropFilter: "blur(4px)" }}>
            {hotel.status}
          </div>
        </div>
        
        <div style={{ padding: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <h1 style={{ margin: 0, fontSize: "32px", color: "#0f172a", fontWeight: 800 }}>{hotel.hotelName}</h1>
            {hotel.hotelType && (
              <span style={{ background: "#e0f2fe", color: "#0284c7", padding: "4px 10px", borderRadius: "6px", fontSize: "14px", fontWeight: 600 }}>
                {hotel.hotelType}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "24px", color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={16} /> {formatLocation(hotel.location)}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Building size={16} /> {hotel.ownerName}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Mail size={16} /> {hotel.email}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Info size={16} /> Reg: {hotel.registrationId}</span>
          </div>
          <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.6", color: "#334155", marginBottom: "20px" }}>{hotel.description || "No description provided."}</p>
          
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div>
              <h3 style={{ margin: "0 0 12px", fontSize: "16px", color: "#0f172a", fontWeight: 700 }}>Hotel Amenities</h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {hotel.amenities.map(amenity => (
                  <span key={amenity} style={{ background: "#f1f5f9", color: "#475569", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 500 }}>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rooms Section Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "24px", color: "#0f172a", fontWeight: 800 }}>Rooms & Inventory</h2>
        
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={18} color="#64748b" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Search rooms..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "10px 14px 10px 40px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", width: "240px", background: "#fff" }}
            />
          </div>
          
          <div style={{ position: "relative" }}>
            <Filter size={18} color="#64748b" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "10px 14px 10px 40px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", appearance: "none", background: "#fff", cursor: "pointer", width: "160px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1", color: "#64748b" }}>
          No rooms found matching your criteria.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
          {filteredRooms.map(room => (
            <div key={room._id} style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
              <div style={{ height: "180px", background: "#f1f5f9", position: "relative" }}>
                {room.images && room.images.length > 0 ? (
                  <img src={room.images[0]} alt={room.roomName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", opacity: 0.3 }}>🛏️</div>
                )}
                <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(0,0,0,0.75)", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                  Room {room.roomNumber}
                </div>
              </div>
              
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>{room.roomName}</h3>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#2563eb" }}>₹{room.price}</div>
                </div>
                
                <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "13px", fontWeight: 500 }}>
                  {room.roomType} · {room.bedType || "Standard"} Bed · Max {room.maxGuests} Guests
                </p>
                
                <div style={{ marginTop: "auto", display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>Status</label>
                    <select 
                      value={room.bookingStatus || "Available"}
                      onChange={(e) => handleStatusChange(room._id, e.target.value)}
                      style={{ 
                        width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontWeight: 600, outline: "none", cursor: "pointer",
                        background: room.bookingStatus === 'Available' ? '#f0fdf4' : room.bookingStatus === 'Booked' ? '#eff6ff' : '#fef2f2',
                        color: room.bookingStatus === 'Available' ? '#166534' : room.bookingStatus === 'Booked' ? '#1e40af' : '#991b1b',
                      }}
                    >
                      <option value="Available">Available</option>
                      <option value="Booked">Booked</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={() => {
                        const prefix = window.location.pathname.startsWith("/hotel") ? "/hotel" : "/adminpage";
                        navigate(`${prefix}/room/${room._id}`);
                    }}
                    style={{ flex: 1, height: "37px", marginTop: "17px", padding: "0", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#334155", fontWeight: 600, fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#e2e8f0"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#f8fafc"}
                  >
                    View Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
