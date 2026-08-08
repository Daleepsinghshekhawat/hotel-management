import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, Calendar as CalendarIcon, Users, CreditCard, CheckCircle2, AlertCircle, Wifi, Wind, Tv, Coffee, Bath, Droplets, Utensils, User, Star, Download } from "lucide-react";
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
    const token = localStorage.getItem("token");
    if (!user || !user._id || !token) {
      navigate("/signup");
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

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(`${URL}/api/pdf/room/${roomId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `room-${roomId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF", error);
      alert("Failed to generate PDF");
    }
  };

  if (!room || !hotel) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "48px", height: "48px", border: "4px solid var(--border-color)", borderTop: "4px solid var(--accent-color)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
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
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header Container */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", padding: "24px 5% 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button onClick={() => navigate(-1)} style={{
              display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none",
              color: "var(--text-secondary)", fontWeight: 600, fontSize: "14px", cursor: "pointer", padding: "0"
            }}>
              <ChevronLeft size={16} /> Back to hotel
            </button>
            <button
              onClick={handleDownloadPDF}
              style={{
                display: "flex", alignItems: "center", gap: "6px", background: "#10b981", color: "#fff",
                border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "14px", cursor: "pointer"
              }}
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
          
          <h1 style={{ margin: "0 0 8px", fontSize: "28px", fontWeight: 700, color: "var(--text-primary)" }}>
            {room.roomName}
          </h1>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "15px" }}>
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

            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "32px", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>Room Details</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "15px", margin: "0 0 24px" }}>{room.description}</p>
              
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)", fontWeight: 500 }}>
                  <Users size={18} color="var(--text-secondary)" /> Up to {room.maxGuests} guests
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)", fontWeight: 500 }}>
                  <CreditCard size={18} color="var(--text-secondary)" /> ₹{room.finalPrice || room.price} / night
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "32px", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 24px" }}>Room Amenities</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "20px" }}>
                {room.wifi && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}><Wifi size={20} color="var(--accent-color)" /> Free WiFi</div>}
                {room.ac && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}><Wind size={20} color="var(--accent-color)" /> Air Conditioning</div>}
                {room.smartTV && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}><Tv size={20} color="var(--accent-color)" /> Smart TV</div>}
                {room.hotWater && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}><Droplets size={20} color="var(--accent-color)" /> Hot Water</div>}
                {room.attachedBathroom && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}><Bath size={20} color="var(--accent-color)" /> Attached Bathroom</div>}
                {room.coffeeMachine && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}><Coffee size={20} color="var(--accent-color)" /> Coffee Machine</div>}
                {room.roomService && <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}><Utensils size={20} color="var(--accent-color)" /> Room Service</div>}
              </div>
            </div>

            {/* Reviews Section */}
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "32px", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 24px" }}>
                Guest Reviews
              </h2>
              {reviews.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>No reviews yet for this property.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {reviews.map(review => (
                    <div key={review._id} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                            <User size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{review.user?.name || "Anonymous"}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={16} fill={star <= review.rating ? "#eab308" : "none"} color={star <= review.rating ? "#eab308" : "var(--border-color)"} />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", margin: "8px 0 0" }}>{review.reviewText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {bookingStep === "calendar" && (
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 24px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CalendarIcon size={20} /> Select Dates
                </h2>
                {renderCalendar()}
              </div>
            )}
          </div>

          {/* Right Side: Sticky Checkout */}
          <div style={{ width: "380px", flexShrink: 0 }}>
            <div style={{ position: "sticky", top: "120px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}>
              
              {bookingStep === "success" ? (
                <div style={{ textAlign: "center" }}>
                  <CheckCircle2 size={64} color="#16a34a" style={{ margin: "0 auto 16px" }} />
                  <h3 style={{ margin: "0 0 8px", fontSize: "24px", color: "var(--text-primary)" }}>Booking Confirmed!</h3>
                  <p style={{ margin: "0 0 24px", color: "var(--text-secondary)" }}>We've sent the details to {form.email}</p>
                  <button 
                    onClick={() => navigate("/user/account/bookings")}
                    style={{ width: "100%", padding: "14px", background: "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                  >
                    View My Bookings
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
                    <div>
                      <span style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>₹{room.finalPrice || room.price}</span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "15px" }}> / night</span>
                    </div>
                  </div>

                  {bookingStep === "calendar" && (
                    <>
                      <div style={{ border: "1px solid var(--border-color)", borderRadius: "12px", overflow: "hidden", marginBottom: "24px" }}>
                        <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)" }}>
                          <div style={{ flex: 1, padding: "12px", borderRight: "1px solid var(--border-color)" }}>
                            <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-primary)" }}>Check-in</div>
                            <div style={{ color: checkIn ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "14px", marginTop: "2px", fontWeight: checkIn ? 600 : 400 }}>{checkIn || "Select date"}</div>
                          </div>
                          <div style={{ flex: 1, padding: "12px" }}>
                            <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-primary)" }}>Checkout</div>
                            <div style={{ color: checkOut ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "14px", marginTop: "2px", fontWeight: checkOut ? 600 : 400 }}>{checkOut || "Select date"}</div>
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
                          background: (!checkIn || !checkOut || lockStatus === "locking") ? "var(--text-tertiary)" : "var(--accent-color)", 
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
                      <h3 style={{ margin: "0 0 16px", fontSize: "18px", color: "var(--text-primary)" }}>Guest Details</h3>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                        <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="Full Name" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: "14px" }} />
                        <input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="Email Address" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: "14px" }} />
                        <input required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="Phone Number" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: "14px" }} />
                        <input type="number" min={1} max={room.maxGuests} required value={form.guests} onChange={e=>setForm({...form, guests: e.target.value})} placeholder="Number of Guests" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: "14px" }} />
                      </div>

                      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginBottom: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
                          <span>₹{room.finalPrice || room.price} x {nights} nights</span>
                          <span>₹{totalCost.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "18px", color: "var(--text-primary)", marginTop: "16px" }}>
                          <span>Total</span>
                          <span>₹{totalCost.toLocaleString()}</span>
                        </div>
                      </div>

                      <button type="submit" style={{ width: "100%", padding: "14px", background: "#e51d53", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "16px", cursor: "pointer", marginBottom: "12px" }}>
                        Confirm Booking
                      </button>
                      <button type="button" onClick={() => setBookingStep("calendar")} style={{ width: "100%", padding: "14px", background: "none", color: "var(--text-secondary)", border: "1px solid var(--border-color)", borderRadius: "8px", fontWeight: 600, fontSize: "16px", cursor: "pointer" }}>
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
