import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, Calendar as CalendarIcon, Users, CreditCard, CheckCircle2, AlertCircle, Wifi, Wind, Tv, Coffee, Bath, Droplets, Utensils, User, Star } from "lucide-react";
import URL from "../api";
import "./RoomDetail.css"; // Keep the calendar CSS but overhaul the layout

export default function RoomDetail() {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  // Calendar data
  const [bookedDates, setBookedDates] = useState([]);
  const [pendingDates, setPendingDates] = useState([]);
  
  // Booking state
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [lockStatus, setLockStatus] = useState(""); 
  const [lockError, setLockError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", guests: 1
  });
  const [bookingStep, setBookingStep] = useState("calendar"); 

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user || !user._id) {
      alert("Please login first.");
      navigate("/login");
      return;
    }
    setForm(p => ({ ...p, name: user.name || "", email: user.email || "" }));

    const fetchData = async () => {
      try {
        const [roomRes, hotelRes, calRes, reviewsRes] = await Promise.all([
          axios.get(`${URL}/api/getRoom/${roomId}`),
          axios.get(`${URL}/api/getHotelById/${hotelId}`),
          axios.get(`${URL}/api/room/${roomId}/calendar`),
          axios.get(`${URL}/api/reviews/hotel/${hotelId}`).catch(() => ({ data: { result: [] } }))
        ]);
        
        setRoom(roomRes.data.result);
        setHotel(hotelRes.data.result);
        setReviews(reviewsRes.data.result || []);
        
        const bDates = [];
        const pDates = [];
        
        const allBookings = calRes.data.bookings || [];
        const allTempBookings = calRes.data.tempBookings || [];

        const getDatesBetween = (start, end) => {
          let dates = [];
          let curr = new Date(start);
          let last = new Date(end);
          curr.setHours(0,0,0,0);
          last.setHours(0,0,0,0);
          while (curr <= last) {
            dates.push(new Date(curr));
            curr.setDate(curr.getDate() + 1);
          }
          return dates;
        };

        allBookings.forEach(b => {
          const dates = getDatesBetween(b.checkIn, b.checkOut);
          const today = new Date();
          today.setHours(0,0,0,0);
          const checkInDate = new Date(b.checkIn);
          checkInDate.setHours(0,0,0,0);
          
          if (b.status === "pending" || checkInDate > today) {
            pDates.push(...dates);
          } else {
            bDates.push(...dates);
          }
        });

        allTempBookings.forEach(t => {
           if (t.user !== user._id) {
             const dates = getDatesBetween(t.checkIn, t.checkOut);
             bDates.push(...dates);
           }
        });

        const toLocalISOString = (date) => {
          const tzOffset = date.getTimezoneOffset() * 60000;
          return new Date(date - tzOffset).toISOString().split("T")[0];
        };

        setBookedDates(bDates.map(toLocalISOString));
        setPendingDates(pDates.map(toLocalISOString));

      } catch (err) {
        console.error("Error fetching room details", err);
      }
    };
    
    fetchData();
  }, [roomId, hotelId, navigate]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDateClick = (dateStr) => {
    if (bookedDates.includes(dateStr) || pendingDates.includes(dateStr)) return;
    
    const dateObj = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (dateObj < today) return; 

    if (!checkIn) {
      setCheckIn(dateStr);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      if (new Date(dateStr) <= new Date(checkIn)) {
        setCheckIn(dateStr);
      } else {
        let curr = new Date(checkIn);
        const end = new Date(dateStr);
        let valid = true;
        while (curr <= end) {
          const tzOffset = curr.getTimezoneOffset() * 60000;
          const dStr = new Date(curr - tzOffset).toISOString().split("T")[0];
          if (bookedDates.includes(dStr) || pendingDates.includes(dStr)) {
            valid = false;
            break;
          }
          curr.setDate(curr.getDate() + 1);
        }
        if (valid) {
          setCheckOut(dateStr);
        } else {
          alert("Selected range includes unavailable dates.");
          setCheckIn(dateStr);
          setCheckOut(null);
        }
      }
    } else {
      setCheckIn(dateStr);
      setCheckOut(null);
    }
  };

  const handleLockDates = async () => {
    if (!checkIn || !checkOut) return;
    setLockStatus("locking");
    setLockError("");
    try {
      const res = await axios.post(`${URL}/api/room/${roomId}/temp-lock`, {
        checkIn, checkOut, userId: user._id
      });
      if (res.data.success) {
        setLockStatus("locked");
        setBookingStep("form");
      }
    } catch (err) {
      setLockStatus("error");
      setLockError(err.response?.data?.message || "Failed to lock dates. Another user may have just booked it.");
    }
  };

  const handleFinalBook = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${URL}/api/createBooking`, {
        hotelId, 
        roomId, 
        guestName: form.name, 
        guestEmail: form.email, 
        guestPhone: form.phone, 
        guests: form.guests,
        checkIn, 
        checkOut, 
        userId: user._id
      });
      if (res.data.success) {
        setBookingStep("success");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  if (!room || !hotel) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "48px", height: "48px", border: "4px solid #e2e8f0", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const nights = (checkIn && checkOut) ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 0;
  const totalCost = nights > 0 ? (room.finalPrice || room.price) * nights : 0;

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d - tzOffset)).toISOString().split("T")[0];
      days.push(localISOTime);
    }

    return (
      <div className="custom-calendar">
        <div className="calendar-header">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>&lt;</button>
          <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>&gt;</button>
        </div>
        <div className="calendar-grid">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="cal-day-name">{d}</div>)}
          {days.map((dateStr, idx) => {
            if (!dateStr) return <div key={`empty-${idx}`} className="cal-cell empty"></div>;
            
            const isBooked = bookedDates.includes(dateStr);
            const isPending = pendingDates.includes(dateStr);
            const isSelected = dateStr === checkIn || dateStr === checkOut || (checkIn && checkOut && dateStr > checkIn && dateStr < checkOut);
            
            const today = new Date();
            today.setHours(0,0,0,0);
            const isPast = new Date(dateStr) < today;

            let className = "cal-cell";
            if (isPast) className += " past";
            else if (isBooked) className += " booked";
            else if (isPending) className += " pending";
            else if (isSelected) className += " selected";
            else className += " available";

            return (
              <div key={dateStr} className={className} onClick={() => !isPast && handleDateClick(dateStr)}>
                {parseInt(dateStr.split("-")[2], 10)}
              </div>
            );
          })}
        </div>
        <div className="calendar-legend">
          <div className="legend-item"><span className="box available"></span> Available</div>
          <div className="legend-item"><span className="box pending"></span> Pending</div>
          <div className="legend-item"><span className="box booked"></span> Booked</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header Container */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "24px 5% 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <button onClick={() => navigate(-1)} style={{
            display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none",
            color: "#64748b", fontWeight: 600, fontSize: "14px", cursor: "pointer", padding: "0", marginBottom: "16px"
          }}>
            <ChevronLeft size={16} /> Back to hotel
          </button>
          
          <h1 style={{ margin: "0 0 8px", fontSize: "28px", fontWeight: 700, color: "#0f172a" }}>
            {room.roomName}
          </h1>
          <p style={{ margin: 0, color: "#475569", fontSize: "15px" }}>
            {hotel.hotelName} • {room.roomType}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "40px auto 80px", padding: "0 5%" }}>
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
          
          {/* Left Side: Info & Calendar */}
          <div style={{ flex: "1 1 600px" }}>
            
            <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "32px", height: "400px" }}>
              <img src={room.images?.[0] || 'https://via.placeholder.com/800x500'} alt="Room" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>Room Details</h2>
              <p style={{ color: "#475569", lineHeight: "1.6", fontSize: "15px", margin: "0 0 24px" }}>{room.description}</p>
              
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0f172a", fontWeight: 500 }}>
                  <Users size={18} color="#64748b" /> Up to {room.maxGuests} guests
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0f172a", fontWeight: 500 }}>
                  <CreditCard size={18} color="#64748b" /> ₹{room.finalPrice || room.price} / night
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: "0 0 24px" }}>Room Amenities</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "20px" }}>
                {room.wifi && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569" }}><Wifi size={20} color="#2563eb" /> Free WiFi</div>}
                {room.ac && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569" }}><Wind size={20} color="#2563eb" /> Air Conditioning</div>}
                {room.smartTV && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569" }}><Tv size={20} color="#2563eb" /> Smart TV</div>}
                {room.hotWater && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569" }}><Droplets size={20} color="#2563eb" /> Hot Water</div>}
                {room.attachedBathroom && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569" }}><Bath size={20} color="#2563eb" /> Attached Bathroom</div>}
                {room.coffeeMachine && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569" }}><Coffee size={20} color="#2563eb" /> Coffee Machine</div>}
                {room.roomService && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569" }}><Utensils size={20} color="#2563eb" /> Room Service</div>}
              </div>
            </div>

            {/* Reviews Section */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: "0 0 24px" }}>
                Guest Reviews
              </h2>
              {reviews.length === 0 ? (
                <p style={{ color: "#64748b", fontStyle: "italic" }}>No reviews yet for this property.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {reviews.map(review => (
                    <div key={review._id} style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                            <User size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#0f172a" }}>{review.user?.name || "Anonymous"}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8" }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={16} fill={star <= review.rating ? "#eab308" : "none"} color={star <= review.rating ? "#eab308" : "#cbd5e1"} />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: "#475569", lineHeight: "1.6", margin: "8px 0 0" }}>{review.reviewText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {bookingStep === "calendar" && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a", margin: "0 0 24px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CalendarIcon size={20} /> Select Dates
                </h2>
                {renderCalendar()}
              </div>
            )}
          </div>

          {/* Right Side: Sticky Checkout */}
          <div style={{ width: "380px", flexShrink: 0 }}>
            <div style={{ position: "sticky", top: "120px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}>
              
              {bookingStep === "success" ? (
                <div style={{ textAlign: "center" }}>
                  <CheckCircle2 size={64} color="#16a34a" style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ margin: "0 0 8px", fontSize: "24px", color: "#0f172a" }}>Booking Confirmed!</h3>
                  <p style={{ margin: "0 0 24px", color: "#475569" }}>We've sent the details to {form.email}</p>
                  <button 
                    onClick={() => navigate("/user/account/bookings")}
                    style={{ width: "100%", padding: "14px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                  >
                    View My Bookings
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
                    <div>
                      <span style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a" }}>₹{room.finalPrice || room.price}</span>
                      <span style={{ color: "#64748b", fontSize: "15px" }}> / night</span>
                    </div>
                  </div>

                  {bookingStep === "calendar" && (
                    <>
                      <div style={{ border: "1px solid #cbd5e1", borderRadius: "12px", overflow: "hidden", marginBottom: "24px" }}>
                        <div style={{ display: "flex", borderBottom: "1px solid #cbd5e1" }}>
                          <div style={{ flex: 1, padding: "12px", borderRight: "1px solid #cbd5e1" }}>
                            <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#0f172a" }}>Check-in</div>
                            <div style={{ color: checkIn ? "#0f172a" : "#64748b", fontSize: "14px", marginTop: "2px", fontWeight: checkIn ? 600 : 400 }}>{checkIn || "Select date"}</div>
                          </div>
                          <div style={{ flex: 1, padding: "12px" }}>
                            <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#0f172a" }}>Checkout</div>
                            <div style={{ color: checkOut ? "#0f172a" : "#64748b", fontSize: "14px", marginTop: "2px", fontWeight: checkOut ? 600 : 400 }}>{checkOut || "Select date"}</div>
                          </div>
                        </div>
                      </div>

                      {lockError && (
                        <div style={{ padding: "12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <AlertCircle size={14} /> {lockError}
                        </div>
                      )}

                      <button
                        onClick={handleLockDates}
                        disabled={!checkIn || !checkOut || lockStatus === "locking"}
                        style={{
                          width: "100%", padding: "14px", borderRadius: "8px", border: "none",
                          background: (!checkIn || !checkOut || lockStatus === "locking") ? "#cbd5e1" : "#2563eb", 
                          color: "#fff", fontWeight: 600, fontSize: "16px",
                          cursor: (!checkIn || !checkOut || lockStatus === "locking") ? "not-allowed" : "pointer"
                        }}
                      >
                        {lockStatus === "locking" ? "Checking..." : "Reserve Dates"}
                      </button>
                    </>
                  )}

                  {bookingStep === "form" && (
                    <form onSubmit={handleFinalBook}>
                      <h3 style={{ margin: "0 0 16px", fontSize: "18px", color: "#0f172a" }}>Guest Details</h3>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                        <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="Full Name" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }} />
                        <input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="Email Address" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }} />
                        <input required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="Phone Number" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }} />
                        <input type="number" min={1} max={room.maxGuests} required value={form.guests} onChange={e=>setForm({...form, guests: e.target.value})} placeholder="Number of Guests" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px" }} />
                      </div>

                      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#475569" }}>
                          <span>₹{room.finalPrice || room.price} x {nights} nights</span>
                          <span>₹{totalCost.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "18px", color: "#0f172a", marginTop: "16px" }}>
                          <span>Total</span>
                          <span>₹{totalCost.toLocaleString()}</span>
                        </div>
                      </div>

                      <button type="submit" style={{ width: "100%", padding: "14px", background: "#e51d53", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "16px", cursor: "pointer", marginBottom: "12px" }}>
                        Confirm Booking
                      </button>
                      <button type="button" onClick={() => setBookingStep("calendar")} style={{ width: "100%", padding: "14px", background: "none", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: 600, fontSize: "16px", cursor: "pointer" }}>
                        Back to Calendar
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
