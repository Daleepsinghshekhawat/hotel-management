import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import URL from "../api";

const formatLocation = (loc) => {
  if (!loc) return "N/A";
  if (typeof loc === "string") return loc;
  return [loc.cityname, loc.district?.districtname, loc.state?.Statename].filter(Boolean).join(", ") || "N/A";
};

const amenityGroups = [
  {
    title: "Room Amenities", items: [
      { key: "wifi", label: "Free WiFi", icon: "📶" },
      { key: "ac", label: "Air Conditioning", icon: "❄️" },
      { key: "heater", label: "Heater", icon: "🔥" },
      { key: "smartTV", label: "Smart TV", icon: "📺" },
      { key: "refrigerator", label: "Refrigerator", icon: "🧊" },
      { key: "microwave", label: "Microwave", icon: "📡" },
      { key: "wardrobe", label: "Wardrobe", icon: "🚪" },
      { key: "workDesk", label: "Work Desk", icon: "💼" },
      { key: "balcony", label: "Balcony", icon: "🌅" },
      { key: "hotWater", label: "Hot Water", icon: "♨️" },
      { key: "bathtub", label: "Bathtub", icon: "🛁" },
      { key: "attachedBathroom", label: "Attached Bathroom", icon: "🚿" },
    ]
  },
  {
    title: "Hotel Facilities", items: [
      { key: "swimmingPool", label: "Swimming Pool", icon: "🏊" },
      { key: "gym", label: "Gym", icon: "💪" },
      { key: "spa", label: "Spa", icon: "🧖" },
      { key: "restaurant", label: "Restaurant", icon: "🍽️" },
      { key: "parking", label: "Free Parking", icon: "🅿️" },
      { key: "bar", label: "Bar", icon: "🍸" },
      { key: "breakfast", label: "Breakfast Included", icon: "🍳" },
      { key: "pets", label: "Pet Friendly", icon: "🐾" },
      { key: "coupleFriendly", label: "Couple Friendly", icon: "💑" },
      { key: "instantBooking", label: "Instant Booking", icon: "⚡" },
      { key: "refundable", label: "Refundable", icon: "💰" },
    ]
  }
];

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomStatuses, setRoomStatuses] = useState({}); // roomId -> { isBooked, checkOut }
  const [loading, setLoading] = useState(true);


  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingStep, setBookingStep] = useState("form"); // "form" | "submitting" | "success" | "error"
  const [bookingResult, setBookingResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [availability, setAvailability] = useState(null); // null | true | false
  const [checkingAvail, setCheckingAvail] = useState(false);


  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm] = useState({
    name: user.name || "", 
    email: user.email || "", 
    phone: "", 
    checkIn: "", 
    checkOut: "", 
    guests: 1,
  });

  
  // Fetch hotel + rooms + all room booking statuses
  const fetchAll = useCallback(async () => {
    try {
      const [hotelRes, roomRes] = await Promise.all([
        axios.get(`${URL}/api/getHotelById/${id}`),
        axios.get(`${URL}/api/getRoomsByHotel/${id}`),
      ]);
      const hotelData = hotelRes.data.result;
      const roomList = roomRes.data.result || [];
      setHotel(hotelData);
      setRooms(roomList);

      // Fetch booking status for each room
      const statusMap = {};
      await Promise.all(roomList.map(async (r) => {
        try {
          const s = await axios.get(`${URL}/api/getRoomBookingStatus/${r._id}`);
          statusMap[r._id] = s.data;
        } catch { statusMap[r._id] = { isCurrentlyBooked: false }; }
      }));
      setRoomStatuses(statusMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Check availability when dates change
  useEffect(() => {
    if (!selectedRoom || !form.checkIn || !form.checkOut) {
      setAvailability(null);
      return;
    }
    if (new Date(form.checkIn) >= new Date(form.checkOut)) {
      setAvailability(null);
      return;
    }
    setCheckingAvail(true);
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${URL}/api/checkAvailability/${selectedRoom._id}`,
          { params: { checkIn: form.checkIn, checkOut: form.checkOut } }
        );
        setAvailability(res.data.available);
      } catch { setAvailability(null); }
      finally { setCheckingAvail(false); }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.checkIn, form.checkOut, selectedRoom]);

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 0;

  const totalCost = selectedRoom && nights > 0
    ? Math.round((selectedRoom.finalPrice || selectedRoom.price) * nights)
    : 0;

  const openBookModal = (room) => {
    setSelectedRoom(room);
    setForm({ name: "", email: "", phone: "", checkIn: "", checkOut: "", guests: 1 });
    setBookingStep("form");
    setAvailability(null);
    setErrorMsg("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.checkIn || !form.checkOut) {
      setErrorMsg("Please select check-in and check-out dates.");
      return;
    }
    if (nights <= 0) {
      setErrorMsg("Check-out must be after check-in.");
      return;
    }
    if (availability === false) {
      setErrorMsg("This room is not available for the selected dates.");
      return;
    }

    setBookingStep("submitting");
    setErrorMsg("");
    try {
      const res = await axios.post(`${URL}/api/createBooking`, {
        hotelId: hotel._id,
        roomId: selectedRoom._id,
        guestName: form.name,
        guestEmail: form.email,
        guestPhone: form.phone,
        guests: form.guests,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
      });

      if (res.data.success) {
        setBookingResult(res.data.result);
        setBookingStep("success");
        // Refresh room statuses
        fetchAll();
      } else {
        setErrorMsg(res.data.message || "Booking failed.");
        setBookingStep("error");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Something went wrong. Please try again.");
      setBookingStep("error");
    }
  };

  const allAmenities = new Set();
  rooms.forEach(r => Object.keys(r).forEach(k => r[k] === true && allAmenities.add(k)));
  const loc = hotel ? formatLocation(hotel.location) : "";

  if (loading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
      <div style={{ width: "48px", height: "48px", border: "4px solid #e2e8f0", borderTop: "4px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#64748b", fontSize: "16px" }}>Loading hotel details...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!hotel) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
      <div style={{ fontSize: "60px" }}>🏨</div>
      <h2 style={{ color: "#1e293b", margin: 0 }}>Hotel not found</h2>
      <button onClick={() => navigate("/user/hotels")} style={{ padding: "12px 28px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 700, fontSize: "15px" }}>
        ← Back to Hotels
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Hero */}
      <div style={{ position: "relative", height: "440px", overflow: "hidden" }}>
        <img
          src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400"}
          alt={hotel.hotelName}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }} />

        <div style={{ position: "absolute", top: "20px", left: "5%" }}>
          <button onClick={() => navigate("/user/hotels")} style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff", padding: "10px 18px", borderRadius: "10px",
            cursor: "pointer", backdropFilter: "blur(10px)", fontWeight: 600, fontSize: "14px"
          }}>
            ← Back to Hotels
          </button>
        </div>

        <div style={{ position: "absolute", bottom: "40px", left: "5%", right: "5%", color: "#fff" }}>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(28px,4vw,52px)", fontWeight: 800, letterSpacing: "-1px" }}>
            {hotel.hotelName}
          </h1>
          <p style={{ margin: "0 0 12px", fontSize: "16px", color: "rgba(255,255,255,0.85)" }}>📍 {loc}</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ background: "rgba(99,102,241,0.9)", padding: "6px 14px", borderRadius: "100px", fontSize: "13px", fontWeight: 600 }}>
              👤 {hotel.ownerName}
            </span>
            <span style={{ background: "rgba(34,197,94,0.9)", padding: "6px 14px", borderRadius: "100px", fontSize: "13px", fontWeight: 600 }}>
              ✅ Active Hotel
            </span>
            <span style={{ background: "rgba(0,0,0,0.5)", padding: "6px 14px", borderRadius: "100px", fontSize: "13px", fontWeight: 600 }}>
              🛏️ {rooms.length} Room Type{rooms.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 5%" }}>
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
          {/* Left Column */}
          <div style={{ flex: "1 1 600px" }}>
            {/* About */}
            <Section title="About This Hotel">
              <p style={{ color: "#475569", lineHeight: 1.85, fontSize: "15px", margin: 0 }}>{hotel.description}</p>
            </Section>

            {/* Amenities */}
            {allAmenities.size > 0 && (
              <Section title="Facilities & Amenities">
                {amenityGroups.map(group => {
                  const groupItems = group.items.filter(item => allAmenities.has(item.key));
                  if (!groupItems.length) return null;
                  return (
                    <div key={group.title} style={{ marginBottom: "20px" }}>
                      <p style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: 800, color: "#6366f1", textTransform: "uppercase", letterSpacing: "1.5px" }}>{group.title}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {groupItems.map(item => (
                          <div key={item.key} style={{
                            display: "flex", alignItems: "center", gap: "7px",
                            padding: "8px 14px", borderRadius: "10px",
                            background: "#f0f4ff", border: "1px solid #e0e7ff",
                            fontSize: "13px", color: "#3730a3", fontWeight: 500
                          }}>
                            {item.icon} {item.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </Section>
            )}

            {/* Rooms */}
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#1e293b", margin: "0 0 20px" }}>
                🛏️ Available Rooms ({rooms.length})
              </h2>
              {rooms.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "20px", color: "#94a3b8" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛏️</div>
                  <p style={{ margin: 0, fontSize: "15px" }}>No rooms configured yet for this hotel.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {rooms.map(room => (
                    <RoomCard
                      key={room._id}
                      room={room}
                      status={roomStatuses[room._id]}
                      onBook={() => openBookModal(room)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sticky Sidebar */}
          <div style={{ width: "280px", flexShrink: 0 }}>
            <div style={{ position: "sticky", top: "90px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Quick Info */}
              <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                <h3 style={{ margin: "0 0 20px", fontWeight: 800, color: "#1e293b", fontSize: "17px" }}>Quick Info</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <InfoRow icon="🏨" label="Hotel" value={hotel.hotelName} />
                  <InfoRow icon="👤" label="Owner" value={hotel.ownerName} />
                  <InfoRow icon="📍" label="Location" value={loc} />
                  <InfoRow icon="📧" label="Email" value={hotel.email} />
                  <InfoRow icon="🛏️" label="Rooms" value={`${rooms.length} type${rooms.length !== 1 ? "s" : ""}`} />
                </div>
              </div>

              {/* Pricing */}
              {rooms.length > 0 && (
                <div style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  borderRadius: "20px", padding: "28px", color: "#fff",
                  boxShadow: "0 8px 30px rgba(99,102,241,0.35)"
                }}>
                  <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 700, opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>Starting From</p>
                  <p style={{ margin: "0 0 4px", fontSize: "36px", fontWeight: 900, letterSpacing: "-1px" }}>
                    ₹{Math.round(Math.min(...rooms.map(r => r.finalPrice || r.price || 0))).toLocaleString()}
                  </p>
                  <p style={{ margin: "0 0 20px", fontSize: "13px", opacity: 0.75 }}>per night</p>
                  <button
                    onClick={() => document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth" })}
                    style={{ width: "100%", padding: "13px", background: "#fff", color: "#6366f1", border: "none", borderRadius: "12px", fontWeight: 800, fontSize: "14px", cursor: "pointer" }}
                  >
                    View Rooms ↓
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ───────── Booking Modal ───────── */}
      {showModal && selectedRoom && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(15,23,42,0.75)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"
        }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{
            background: "#fff", borderRadius: "28px",
            maxWidth: "540px", width: "100%", maxHeight: "92vh",
            overflowY: "auto", position: "relative",
            boxShadow: "0 30px 80px rgba(0,0,0,0.3)"
          }}>
            {/* Close */}
            <button onClick={() => setShowModal(false)} style={{
              position: "absolute", top: "20px", right: "20px", zIndex: 1,
              background: "#f1f5f9", border: "none", borderRadius: "10px",
              width: "38px", height: "38px", cursor: "pointer",
              fontSize: "18px", fontWeight: 700, color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>✕</button>

            {/* Modal Header */}
            <div style={{ padding: "32px 32px 0" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "24px" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px"
                }}>🛎️</div>
                <div>
                  <h2 style={{ margin: 0, fontWeight: 800, color: "#1e293b", fontSize: "20px" }}>Book Room</h2>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>{selectedRoom.roomName} · {selectedRoom.roomType}</p>
                </div>
              </div>
            </div>

            {/* ── SUCCESS ── */}
            {bookingStep === "success" && bookingResult && (
              <div style={{ padding: "0 32px 40px", textAlign: "center" }}>
                <div style={{ fontSize: "72px", margin: "20px 0 16px" }}>🎉</div>
                <h2 style={{ color: "#1e293b", fontWeight: 800, margin: "0 0 8px" }}>Booking Confirmed!</h2>
                <p style={{ color: "#64748b", margin: "0 0 28px", fontSize: "15px" }}>
                  Your room has been successfully booked.
                </p>
                <div style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #bbf7d0", borderRadius: "16px", padding: "24px", textAlign: "left", marginBottom: "28px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "1px" }}>Booking ID</p>
                  <p style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 800, color: "#166534", fontFamily: "monospace" }}>{bookingResult.bookingId}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <DetailItem label="Hotel" value={hotel.hotelName} />
                    <DetailItem label="Room" value={selectedRoom.roomName} />
                    <DetailItem label="Check-in" value={new Date(bookingResult.checkIn).toLocaleDateString("en-IN")} />
                    <DetailItem label="Check-out" value={new Date(bookingResult.checkOut).toLocaleDateString("en-IN")} />
                    <DetailItem label="Nights" value={bookingResult.nights} />
                    <DetailItem label="Guests" value={bookingResult.guests} />
                  </div>
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#166534", fontSize: "15px" }}>Total Amount</span>
                    <span style={{ fontWeight: 900, color: "#166534", fontSize: "24px" }}>₹{bookingResult.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "14px", fontWeight: 800, fontSize: "16px", cursor: "pointer" }}
                >
                  Done ✓
                </button>
              </div>
            )}

            {/* ── FORM ── */}
            {(bookingStep === "form" || bookingStep === "submitting" || bookingStep === "error") && (
              <form onSubmit={handleSubmit} style={{ padding: "0 32px 40px" }}>
                {/* Price summary */}
                <div style={{ background: "#f8faff", borderRadius: "14px", padding: "18px", marginBottom: "24px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Price/night</span>
                    <span style={{ fontWeight: 700, color: "#1e293b" }}>₹{Math.round(selectedRoom.finalPrice || selectedRoom.price).toLocaleString()}</span>
                  </div>
                  {selectedRoom.discount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "#22c55e", fontSize: "13px" }}>Discount ({selectedRoom.discount}%)</span>
                      <span style={{ color: "#22c55e", fontWeight: 600, fontSize: "13px" }}>Applied ✓</span>
                    </div>
                  )}
                  {nights > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #e2e8f0", marginTop: "6px" }}>
                      <span style={{ fontWeight: 700, color: "#1e293b" }}>Total ({nights} night{nights > 1 ? "s" : ""})</span>
                      <span style={{ fontWeight: 900, color: "#6366f1", fontSize: "20px" }}>₹{totalCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Availability indicator */}
                {form.checkIn && form.checkOut && nights > 0 && (
                  <div style={{
                    padding: "12px 16px", borderRadius: "12px", marginBottom: "20px",
                    background: checkingAvail ? "#f8faff"
                      : availability === true ? "#f0fdf4"
                      : availability === false ? "#fef2f2"
                      : "#f8faff",
                    border: `1px solid ${checkingAvail ? "#e2e8f0" : availability === true ? "#bbf7d0" : availability === false ? "#fecaca" : "#e2e8f0"}`,
                    fontSize: "14px", fontWeight: 600,
                    color: checkingAvail ? "#64748b"
                      : availability === true ? "#166534"
                      : availability === false ? "#dc2626"
                      : "#64748b",
                    display: "flex", alignItems: "center", gap: "8px"
                  }}>
                    {checkingAvail ? "⏳ Checking availability..." : availability === true ? "✅ Room available for selected dates!" : availability === false ? "❌ Room already booked for these dates" : ""}
                  </div>
                )}

                {/* Error */}
                {(bookingStep === "error" || errorMsg) && (
                  <div style={{ padding: "14px 18px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", color: "#dc2626", fontSize: "14px", fontWeight: 600, marginBottom: "20px" }}>
                    ⚠️ {errorMsg}
                    {bookingStep === "error" && (
                      <button type="button" onClick={() => { setBookingStep("form"); setErrorMsg(""); }} style={{ marginLeft: "12px", background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontWeight: 700, fontSize: "13px" }}>Try Again</button>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <FormField label="Full Name *" value={form.name} onChange={v => setForm(p => ({...p, name: v}))} placeholder="Your full name" required />
                  <FormField label="Email Address *" type="email" value={form.email} onChange={v => setForm(p => ({...p, email: v}))} placeholder="your@email.com" required />
                  <FormField label="Phone Number *" value={form.phone} onChange={v => setForm(p => ({...p, phone: v}))} placeholder="+91 98765 43210" required />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <FormField
                      label="Check-in *" type="date" value={form.checkIn}
                      onChange={v => setForm(p => ({...p, checkIn: v, checkOut: p.checkOut && p.checkOut <= v ? "" : p.checkOut}))}
                      required min={new Date().toISOString().split("T")[0]}
                    />
                    <FormField
                      label="Check-out *" type="date" value={form.checkOut}
                      onChange={v => setForm(p => ({...p, checkOut: v}))}
                      required min={form.checkIn || new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <FormField
                    label={`Number of Guests (max ${selectedRoom.maxGuests || 4})`}
                    type="number" value={form.guests}
                    onChange={v => setForm(p => ({...p, guests: v}))}
                    min={1} max={selectedRoom.maxGuests || 4}
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingStep === "submitting" || availability === false}
                  style={{
                    width: "100%", marginTop: "28px", padding: "17px",
                    background: availability === false
                      ? "#e2e8f0"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: availability === false ? "#94a3b8" : "#fff",
                    border: "none", borderRadius: "14px",
                    fontWeight: 800, fontSize: "16px",
                    cursor: (bookingStep === "submitting" || availability === false) ? "not-allowed" : "pointer",
                    boxShadow: availability === false ? "none" : "0 8px 25px rgba(99,102,241,0.35)",
                    transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
                  }}
                >
                  {bookingStep === "submitting" ? (
                    <>
                      <div style={{ width: "18px", height: "18px", border: "3px solid rgba(255,255,255,0.3)", borderTop: "3px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Confirming Booking...
                    </>
                  ) : (
                    `🛎️ Confirm Booking${totalCost > 0 ? ` — ₹${totalCost.toLocaleString()}` : ""}`
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", marginBottom: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <h2 style={{ margin: "0 0 20px", fontWeight: 800, color: "#1e293b", fontSize: "20px" }}>{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "1px" }}>{icon}</span>
      <div>
        <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "14px", color: "#1e293b", fontWeight: 500, marginTop: "2px" }}>{value}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: "11px", color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#14532d" }}>{value}</p>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text", placeholder, required, min, max }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#475569", marginBottom: "7px" }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} min={min} max={max}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: "11px",
          border: "2px solid #e2e8f0", fontSize: "14px",
          outline: "none", boxSizing: "border-box", color: "#1e293b",
          fontFamily: "inherit", transition: "border-color 0.2s"
        }}
        onFocus={e => e.target.style.borderColor = "#6366f1"}
        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
      />
    </div>
  );
}

function RoomCard({ room, status, onBook }) {
  const [expanded, setExpanded] = useState(false);
  const isBooked = room.bookingStatus === "Booked" || status?.isCurrentlyBooked;
  const isMaintenance = room.bookingStatus === "Maintenance";
  const isUnavailable = isBooked || isMaintenance;

  const amenities = [
    room.wifi && "📶 WiFi", room.ac && "❄️ AC", room.swimmingPool && "🏊 Pool",
    room.gym && "💪 Gym", room.spa && "🧖 Spa", room.parking && "🅿️ Parking",
    room.restaurant && "🍽️ Restaurant", room.breakfast && "🍳 Breakfast",
    room.balcony && "🌅 Balcony", room.bathtub && "🛁 Bathtub",
    room.hotWater && "♨️ Hot Water", room.pets && "🐾 Pet Friendly",
  ].filter(Boolean);

  return (
    <div style={{
      background: "#fff", borderRadius: "20px", overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      border: isBooked ? "2px solid #fecaca" : isMaintenance ? "2px solid #fef3c7" : "2px solid transparent",
      transition: "box-shadow 0.3s"
    }}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {/* Image */}
        <div style={{ width: "220px", flexShrink: 0, minHeight: "200px", position: "relative", background: "#f1f5f9" }}>
          {room.images?.length > 0 ? (
            <img src={room.images[0]} alt={room.roomName} style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: "200px" }} />
          ) : (
            <div style={{ width: "100%", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "52px", background: "linear-gradient(135deg,#f0f4ff,#e0e7ff)" }}>🛏️</div>
          )}
          {/* Status badge */}
          <div style={{
            position: "absolute", top: "12px", left: "12px",
            background: isBooked ? "#ef4444" : isMaintenance ? "#f59e0b" : "#22c55e",
            color: "#fff", padding: "5px 12px", borderRadius: "100px",
            fontSize: "12px", fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}>
            {isBooked ? "🔴 Booked" : isMaintenance ? "🔧 Maintenance" : "🟢 Available"}
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", minWidth: "240px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
            <div>
              <h3 style={{ margin: "0 0 6px", fontWeight: 800, color: "#1e293b", fontSize: "19px" }}>{room.roomName}</h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <Chip bg="#f0f4ff" color="#4338ca">{room.roomType}</Chip>
                {room.bedType && <Chip bg="#faf5ff" color="#7c3aed">🛏️ {room.bedType}</Chip>}
                {room.roomView && <Chip bg="#f0fdf4" color="#166534">👁️ {room.roomView} View</Chip>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {room.discount > 0 && (
                <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8", textDecoration: "line-through" }}>
                  ₹{Math.round(room.price).toLocaleString()}
                </p>
              )}
              <p style={{ margin: "0", fontSize: "28px", fontWeight: 900, color: "#6366f1", letterSpacing: "-0.5px" }}>
                ₹{Math.round(room.finalPrice || room.price).toLocaleString()}
                <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>/night</span>
              </p>
              {room.discount > 0 && (
                <span style={{ background: "#dcfce7", color: "#166534", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>
                  {room.discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Specs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", color: "#64748b", fontSize: "13px", marginBottom: "14px" }}>
            <span>👥 {room.maxGuests || room.adults || 2} Guests Max</span>
            <span>🛏️ {room.beds || 1} Bed{(room.beds || 1) > 1 ? "s" : ""}</span>
            {room.roomSize && <span>📐 {room.roomSize} sqft</span>}
            <span>🏢 Floor {room.floor || 1}</span>
            <span>🚪 Room {room.roomNumber}</span>
          </div>

          {/* Booked info */}
          {isBooked && status?.nextAvailableFrom && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>
              🔴 Currently occupied · Available from {new Date(status.nextAvailableFrom).toLocaleDateString("en-IN")}
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              {(expanded ? amenities : amenities.slice(0, 6)).map((a, i) => (
                <span key={i} style={{ fontSize: "12px", background: "#f8faff", color: "#4338ca", padding: "4px 10px", borderRadius: "8px", fontWeight: 500, border: "1px solid #e0e7ff" }}>{a}</span>
              ))}
              {amenities.length > 6 && (
                <button onClick={() => setExpanded(!expanded)} style={{ fontSize: "12px", background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontWeight: 700 }}>
                  {expanded ? "Show less ▲" : `+${amenities.length - 6} more ▼`}
                </button>
              )}
            </div>
          )}

          {/* Book Button */}
          <div style={{ marginTop: "auto" }}>
            <button
              onClick={() => !isUnavailable && onBook()}
              disabled={isUnavailable}
              style={{
                width: "100%", padding: "14px 20px", borderRadius: "12px", border: "none",
                background: isBooked
                  ? "linear-gradient(135deg,#ef4444,#dc2626)"
                  : isMaintenance
                  ? "linear-gradient(135deg,#f59e0b,#d97706)"
                  : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff", fontWeight: 800, fontSize: "15px",
                cursor: isUnavailable ? "not-allowed" : "pointer",
                boxShadow: isUnavailable ? "none" : "0 4px 15px rgba(99,102,241,0.35)",
                transition: "opacity 0.2s", opacity: isUnavailable ? 0.85 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}
              onMouseEnter={e => { if (!isUnavailable) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={e => { if (!isUnavailable) e.currentTarget.style.opacity = "1"; }}
            >
              {isBooked ? "🔴 Currently Booked" : isMaintenance ? "🔧 Under Maintenance" : "🛎️ Book Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children, bg = "#f1f5f9", color = "#475569" }) {
  return (
    <span style={{ background: bg, color, padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600 }}>
      {children}
    </span>
  );
}
