import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import URL from "../api";
import "./RoomDetail.css";

export default function RoomDetail() {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  
  // Calendar data
  const [bookedDates, setBookedDates] = useState([]); // Dates fully booked (Red)
  const [pendingDates, setPendingDates] = useState([]); // Dates pending (Yellow)
  
  // Booking state
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [lockStatus, setLockStatus] = useState(""); // "", "locking", "locked", "error"
  const [lockError, setLockError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", guests: 1
  });
  const [bookingStep, setBookingStep] = useState("calendar"); // calendar -> form -> success

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
        const [roomRes, hotelRes, calRes] = await Promise.all([
          axios.get(`${URL}/api/getRoom/${roomId}`),
          axios.get(`${URL}/api/getHotelById/${hotelId}`),
          axios.get(`${URL}/api/room/${roomId}/calendar`)
        ]);
        
        setRoom(roomRes.data.result);
        setHotel(hotelRes.data.result);
        
        // Parse calendar dates
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
          
          // Determine if it should be red (checked in) or yellow (not checked in yet)
          const today = new Date();
          today.setHours(0,0,0,0);
          const checkInDate = new Date(b.checkIn);
          checkInDate.setHours(0,0,0,0);
          
          if (b.status === "pending" || checkInDate > today) {
            // Not checked in yet or explicitly pending -> Yellow
            pDates.push(...dates);
          } else {
            // Checked in -> Red
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
    if (bookedDates.includes(dateStr) || pendingDates.includes(dateStr)) return; // Blocked
    
    const dateObj = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (dateObj < today) return; // Past date

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

  if (!room || !hotel) return <div style={{padding:"40px", textAlign:"center"}}>Loading...</div>;

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
          <div className="legend-item"><span className="box booked"></span> Booked / Locked</div>
        </div>
      </div>
    );
  };

  return (
    <div className="room-detail-container">
      <div className="room-header">
        <h1>{room.roomName}</h1>
        <p>{hotel.hotelName} - {room.roomType}</p>
      </div>

      <div className="room-layout">
        <div className="room-info">
           <img src={room.images?.[0] || 'https://via.placeholder.com/600x400'} alt="Room" className="room-main-img"/>
           <h3>Details</h3>
           <p><strong>Price:</strong> ₹{room.finalPrice || room.price} / night</p>
           <p><strong>Max Guests:</strong> {room.maxGuests}</p>
           <p>{room.description}</p>
        </div>

        <div className="room-booking-section">
          {bookingStep === "calendar" && (
            <div className="calendar-section">
              <h3>Select Dates</h3>
              {renderCalendar()}
              
              <div className="date-selection">
                <p>Check-in: {checkIn || "Select"}</p>
                <p>Check-out: {checkOut || "Select"}</p>
              </div>

              {lockError && <div className="error-msg">{lockError}</div>}

              <button 
                className="btn-lock" 
                onClick={handleLockDates}
                disabled={!checkIn || !checkOut || lockStatus === "locking"}
              >
                {lockStatus === "locking" ? "Locking..." : "Lock Dates & Continue"}
              </button>
            </div>
          )}

          {bookingStep === "form" && (
            <form onSubmit={handleFinalBook} className="booking-form">
              <h3>Guest Details</h3>
              <div className="form-group">
                <label>Name</label>
                <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})}/>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})}/>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})}/>
              </div>
              <div className="form-group">
                <label>Guests</label>
                <input type="number" min={1} max={room.maxGuests} required value={form.guests} onChange={e=>setForm({...form, guests: e.target.value})}/>
              </div>
              
              <div className="summary">
                <p>Check-in: {checkIn}</p>
                <p>Check-out: {checkOut}</p>
              </div>
              <button className="btn-submit" type="submit">Confirm Booking</button>
              <button type="button" className="btn-cancel" onClick={() => setBookingStep("calendar")}>Back</button>
            </form>
          )}

          {bookingStep === "success" && (
            <div className="success-msg">
              <h3>Booking Successful!</h3>
              <p>Your room has been booked.</p>
              <button onClick={() => navigate("/user/account/bookings")}>View My Bookings</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
