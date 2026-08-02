import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Wifi, Wind, Flame, Tv, MonitorPlay, Coffee, Grid, BedDouble, Bath, Droplets, Home, Utensils, Cigarette, Heart, Dog, MapPin, Maximize, CheckCircle2 } from "lucide-react";
import URL from "../api";

const API = `${URL}/api`;

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoom();
  }, []);

  const getRoom = async () => {
    try {
      const res = await axios.get(`${API}/getRoom/${id}`);
      if (res.data.success) {
        setRoom(res.data.result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "100px", textAlign: "center", color: "#64748b", fontSize: "18px" }}>Loading premium room details...</div>;
  }

  if (!room) {
    return <div style={{ padding: "100px", textAlign: "center", color: "#ef4444", fontSize: "18px" }}>Room Not Found</div>;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Top Navbar Area */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "#475569", cursor: "pointer", fontWeight: 600, fontSize: "15px", padding: 0 }}
        >
          <ArrowLeft size={20} /> Back to Hotel
        </button>
        <button
          onClick={() => {
            const prefix = window.location.pathname.startsWith("/hotel") ? "/hotel" : "/adminpage";
            navigate(`${prefix}/edit-room/${room._id}`);
          }}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "#2563eb", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" }}
        >
          <Edit size={16} /> Edit Room
        </button>
      </div>

      {/* All Images Gallery */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 32px", padding: "0 24px" }}>
        {room.images && room.images.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {room.images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`Room view ${idx + 1}`} 
                style={{ 
                  width: "100%", 
                  height: "auto", 
                  display: "block", 
                  borderRadius: "24px", 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.06)" 
                }} 
              />
            ))}
          </div>
        ) : (
          <div style={{ width: "100%", padding: "100px 0", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "60px", opacity: 0.5, background: "#e2e8f0" }}>🛏️</div>
        )}
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 60px", display: "grid", gridTemplateColumns: "1fr 350px", gap: "32px", alignItems: "start" }}>
        
        {/* Main Content Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Header Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <span style={{ background: "#1e293b", color: "#fff", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                {room.roomType}
              </span>
              <span style={{ 
                padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, textTransform: "uppercase",
                background: room.bookingStatus === 'Available' ? '#dcfce7' : room.bookingStatus === 'Booked' ? '#dbeafe' : '#fef2f2',
                color: room.bookingStatus === 'Available' ? '#166534' : room.bookingStatus === 'Booked' ? '#1e40af' : '#991b1b',
              }}>
                {room.bookingStatus}
              </span>
            </div>
            
            <h1 style={{ fontSize: "42px", color: "#0f172a", fontWeight: 800, margin: "0 0 16px", lineHeight: "1.2" }}>{room.roomName}</h1>
            
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", color: "#475569", fontSize: "15px", fontWeight: 500 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><MapPin size={18} /> Room {room.roomNumber} (Floor {room.floor})</span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><Maximize size={18} /> {room.roomSize} sqft</span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><BedDouble size={18} /> {room.beds} {room.bedType} Bed</span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><Home size={18} /> Max {room.maxGuests} Guests</span>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0" }} />

          {/* Description */}
          <div>
            <h2 style={{ fontSize: "22px", color: "#0f172a", fontWeight: 700, margin: "0 0 16px" }}>About this room</h2>
            <p style={{ color: "#475569", fontSize: "16px", lineHeight: "1.7", margin: 0 }}>
              {room.description || "Experience comfort and luxury in this beautifully appointed room designed to meet all your needs. Perfect for relaxation after a long day."}
            </p>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0" }} />

          {/* All Facilities */}
          <div>
            <h2 style={{ fontSize: "22px", color: "#0f172a", fontWeight: 700, margin: "0 0 24px" }}>What this place offers</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              
              {/* Amenities */}
              <div>
                <h3 style={{ fontSize: "16px", color: "#334155", fontWeight: 600, margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}><Grid size={18} /> Room Amenities</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {room.wifi && <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "15px" }}><Wifi size={20} color="#2563eb" /> Fast WiFi</div>}
                  {room.ac && <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "15px" }}><Wind size={20} color="#2563eb" /> Air Conditioning</div>}
                  {room.heater && <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "15px" }}><Flame size={20} color="#2563eb" /> Heater</div>}
                  {room.smartTV && <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "15px" }}><Tv size={20} color="#2563eb" /> Smart TV</div>}
                  {room.ott && <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "15px" }}><MonitorPlay size={20} color="#2563eb" /> OTT Platforms</div>}
                  {room.coffeeMachine && <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "15px" }}><Coffee size={20} color="#2563eb" /> Coffee Machine</div>}
                </div>
              </div>

              {/* Bathroom & Meals */}
              <div>
                <h3 style={{ fontSize: "16px", color: "#334155", fontWeight: 600, margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}><Bath size={18} /> Bath & Dining</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {room.attachedBathroom && <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "15px" }}><Droplets size={20} color="#2563eb" /> Attached Bathroom</div>}
                  {room.bathtub && <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "15px" }}><Bath size={20} color="#2563eb" /> Bathtub</div>}
                  {room.breakfast && <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "15px" }}><Utensils size={20} color="#2563eb" /> Breakfast Included</div>}
                  {room.lunch && <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "15px" }}><Utensils size={20} color="#2563eb" /> Lunch Available</div>}
                  {room.dinner && <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#475569", fontSize: "15px" }}><Utensils size={20} color="#2563eb" /> Dinner Available</div>}
                </div>
              </div>

            </div>
          </div>
          
        </div>

        {/* Sticky Sidebar Pricing & Policies */}
        <div style={{ position: "sticky", top: "24px" }}>
          
          {/* Pricing Card */}
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", boxShadow: "0 10px 40px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "36px", fontWeight: 800, color: "#0f172a", lineHeight: "1" }}>₹{room.finalPrice || room.price}</span>
              <span style={{ fontSize: "16px", color: "#64748b", fontWeight: 500, paddingBottom: "4px" }}>/ night</span>
            </div>
            
            {room.discount > 0 && (
              <div style={{ fontSize: "14px", color: "#16a34a", fontWeight: 600, marginBottom: "24px" }}>
                <del style={{ color: "#94a3b8", fontWeight: 400, marginRight: "6px" }}>₹{room.price}</del>
                {room.discount}% OFF applied
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: "15px" }}>
                <span>Base Price</span>
                <span>₹{room.price}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: "15px" }}>
                <span>Discount</span>
                <span style={{ color: "#16a34a" }}>- {room.discount}%</span>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#0f172a", fontSize: "16px", fontWeight: 700 }}>
                <span>Final Price</span>
                <span>₹{room.finalPrice || room.price}</span>
              </div>
            </div>
          </div>

          {/* Policies Card */}
          <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "18px", color: "#0f172a", fontWeight: 700, margin: "0 0 16px" }}>Room Policies</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {room.coupleFriendly && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <Heart size={20} color="#e11d48" style={{ marginTop: "2px" }} />
                  <div>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>Couple Friendly</div>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Unmarried couples are welcome here.</div>
                  </div>
                </div>
              )}
              
              {room.pets && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <Dog size={20} color="#d97706" style={{ marginTop: "2px" }} />
                  <div>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>Pets Allowed</div>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Furry friends are permitted in this room.</div>
                  </div>
                </div>
              )}
              
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <Cigarette size={20} color={room.smoking ? "#ea580c" : "#94a3b8"} style={{ marginTop: "2px" }} />
                <div>
                  <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>{room.smoking ? "Smoking Allowed" : "Non-Smoking Room"}</div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>{room.smoking ? "Smoking is permitted inside." : "Smoking is strictly prohibited."}</div>
                </div>
              </div>

              {room.refundable && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <CheckCircle2 size={20} color="#16a34a" style={{ marginTop: "2px" }} />
                  <div>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>Fully Refundable</div>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Cancel before check-in for a full refund.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;