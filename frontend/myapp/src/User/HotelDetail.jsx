import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, CheckCircle2, User, ChevronLeft, Wifi, Wind, Thermometer, Tv, Refrigerator, Microwave, DoorClosed, Briefcase, Sunset, Bath, Droplets, Waves, Dumbbell, Sparkles, Utensils, ParkingCircle, Martini, Coffee, Dog, Heart, Zap, Banknote, BedDouble, Expand, Maximize, CalendarCheck, Clock, Users, Star, Download } from "lucide-react";
import URL from "../api";

const formatLocation = (loc) => {
  if (!loc) return "N/A";
  if (typeof loc === "string") return loc;
  return [loc.cityname, loc.district?.districtname, loc.state?.Statename].filter(Boolean).join(", ") || "N/A";
};

const amenityGroups = [
  {
    title: "Room Amenities", items: [
      { key: "wifi", label: "Free WiFi", icon: <Wifi size={18} /> },
      { key: "ac", label: "Air Conditioning", icon: <Wind size={18} /> },
      { key: "heater", label: "Heater", icon: <Thermometer size={18} /> },
      { key: "smartTV", label: "Smart TV", icon: <Tv size={18} /> },
      { key: "refrigerator", label: "Refrigerator", icon: <Refrigerator size={18} /> },
      { key: "microwave", label: "Microwave", icon: <Microwave size={18} /> },
      { key: "wardrobe", label: "Wardrobe", icon: <DoorClosed size={18} /> },
      { key: "workDesk", label: "Work Desk", icon: <Briefcase size={18} /> },
      { key: "balcony", label: "Balcony", icon: <Sunset size={18} /> },
      { key: "hotWater", label: "Hot Water", icon: <Droplets size={18} /> },
      { key: "bathtub", label: "Bathtub", icon: <Bath size={18} /> },
      { key: "attachedBathroom", label: "Attached Bathroom", icon: <Bath size={18} /> },
    ]
  },
  {
    title: "Hotel Facilities", items: [
      { key: "swimmingPool", label: "Swimming Pool", icon: <Waves size={18} /> },
      { key: "gym", label: "Gym", icon: <Dumbbell size={18} /> },
      { key: "spa", label: "Spa", icon: <Sparkles size={18} /> },
      { key: "restaurant", label: "Restaurant", icon: <Utensils size={18} /> },
      { key: "parking", label: "Free Parking", icon: <ParkingCircle size={18} /> },
      { key: "bar", label: "Bar", icon: <Martini size={18} /> },
      { key: "breakfast", label: "Breakfast Included", icon: <Coffee size={18} /> },
      { key: "pets", label: "Pet Friendly", icon: <Dog size={18} /> },
      { key: "coupleFriendly", label: "Couple Friendly", icon: <Heart size={18} /> },
      { key: "instantBooking", label: "Instant Booking", icon: <Zap size={18} /> },
      { key: "refundable", label: "Refundable", icon: <Banknote size={18} /> },
    ]
  }
];

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availableRoomIds, setAvailableRoomIds] = useState(null);
  const [selectedRoomAmenities, setSelectedRoomAmenities] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchAll = useCallback(async () => {
    try {
      const [hotelRes, roomRes, reviewsRes] = await Promise.all([
        axios.get(`${URL}/api/getHotelById/${id}`),
        axios.get(`${URL}/api/getRoomsByHotel/${id}`),
        axios.get(`${URL}/api/reviews/getReviewsByHotel/${id}`),
      ]);
      const hotelData = hotelRes.data.result;
      const roomList = roomRes.data.result || [];
      setHotel(hotelData);
      setRooms(roomList);
      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.result || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openBookModal = (room) => {
    const token = localStorage.getItem("token");
    if (!currentUser || !currentUser._id || !token) {
      navigate("/signup");
      return;
    }
    navigate(`/user/hotel/${id}/room/${room._id}`);
  };

  const handleCheckAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      alert("Please select both check-in and check-out dates.");
      return;
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(checkInDate) < today) {
      alert("Check-in date cannot be in the past.");
      return;
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      alert("Check-out date must be after check-in date.");
      return;
    }
    
    setIsCheckingAvailability(true);
    try {
      const availabilities = await Promise.all(rooms.map(async (r) => {
        try {
          const res = await axios.get(`${URL}/api/checkAvailability/${r._id}?checkIn=${checkInDate}&checkOut=${checkOutDate}`);
          return { roomId: r._id, available: res.data.available };
        } catch (error) {
          console.error(`Error checking room ${r._id}`, error);
          return { roomId: r._id, available: false };
        }
      }));
      const availableIds = availabilities.filter(a => a.available).map(a => a.roomId);
      setAvailableRoomIds(availableIds);
    } catch (error) {
      console.error(error);
      alert("Failed to check availability");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const clearDates = () => {
    setCheckInDate("");
    setCheckOutDate("");
    setAvailableRoomIds(null);
  };
  
  const toggleRoomAmenity = (key) => {
    setSelectedRoomAmenities(prev => 
      prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]
    );
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!currentUser || !currentUser._id || !token) {
      navigate("/signup");
      return;
    }
    if (!reviewText.trim()) {
      alert("Please write a review text.");
      return;
    }
    try {
      setIsSubmittingReview(true);
      const payload = {
        hotelId: id,
        userId: currentUser._id,
        rating,
        reviewText
      };
      const res = await axios.post(`${URL}/api/reviews/addReview`, payload);
      if (res.data.success) {
        alert("Review added successfully");
        setReviewText("");
        setRating(5);
        // Refresh reviews
        const updatedReviews = await axios.get(`${URL}/api/reviews/getReviewsByHotel/${id}`);
        if (updatedReviews.data.success) {
          setReviews(updatedReviews.data.result || []);
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(`${URL}/api/pdf/hotel/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hotel-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF", error);
      alert("Failed to generate PDF");
    }
  };

  const allAmenities = new Set();
  rooms.forEach(r => Object.keys(r).forEach(k => r[k] === true && allAmenities.add(k)));
  const loc = hotel ? formatLocation(hotel.location) : "";

  if (loading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "48px", height: "48px", border: "4px solid var(--border-color)", borderTop: "4px solid var(--accent-color)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!hotel) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ color: "var(--text-primary)", margin: 0, fontSize: "24px" }}>Property not found</h2>
      <button onClick={() => navigate("/user/hotels")} style={{ padding: "12px 24px", background: "var(--accent-color)", color: "#fff", border: "none", borderRadius: "100px", cursor: "pointer", fontWeight: 600 }}>
        Back to search
      </button>
    </div>
  );

  const minPrice = rooms.length > 0 ? Math.min(...rooms.map(r => r.finalPrice || r.price || 0)) : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Container */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 5%" }}>
        
        {/* Header Section */}
        <div style={{ padding: "32px 0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button onClick={() => navigate("/user/hotels")} style={{
              display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none",
              color: "var(--text-secondary)", fontWeight: 600, fontSize: "14px", cursor: "pointer", padding: "0"
            }}>
              <ChevronLeft size={16} /> Back to properties
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
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 700, color: "var(--text-primary)" }}>
              {hotel.hotelName}
            </h1>
            {hotel.hotelType && (
              <span style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--accent-color)", padding: "4px 10px", borderRadius: "6px", fontSize: "14px", fontWeight: 600 }}>
                {hotel.hotelType}
              </span>
            )}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-secondary)", fontSize: "15px", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 500, textDecoration: "underline", cursor: "pointer" }}>
              <MapPin size={16} color="var(--text-primary)" /> {loc}
            </span>
            <span>•</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={16} /> Hosted by {hotel.ownerName}
            </span>
            <span>•</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a", fontWeight: 600 }}>
              <CheckCircle2 size={16} /> Verified Property
            </span>
          </div>
        </div>

        {/* Hero Image gallery - Airbnb style (1 large, others if existed. Since we have 1 hotel image, we make it full width rounded) */}
        <div style={{ width: "100%", height: "500px", borderRadius: "16px", overflow: "hidden", marginBottom: "48px" }}>
          <img
            src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400"}
            alt={hotel.hotelName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Content Layout */}
        <div style={{ display: "flex", gap: "60px", flexWrap: "wrap", paddingBottom: "80px" }}>
          
          {/* Main Content (Left) */}
          <div style={{ flex: "1 1 600px" }}>
            
            <div style={{ paddingBottom: "32px", borderBottom: "1px solid var(--border-color)", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>About this place</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "16px", margin: 0, whiteSpace: "pre-wrap" }}>
                {hotel.description}
              </p>
            </div>

            {/* Hotel Level Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div style={{ paddingBottom: "32px", borderBottom: "1px solid var(--border-color)", marginBottom: "32px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 24px" }}>Hotel Amenities</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                  {hotel.amenities.map(amenity => (
                    <div key={amenity} style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-secondary)", fontSize: "16px" }}>
                      <span style={{ color: "var(--accent-color)" }}>✓</span> {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room specific Amenities */}
            {allAmenities.size > 0 && (
              <div style={{ paddingBottom: "32px", borderBottom: "1px solid var(--border-color)", marginBottom: "32px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 24px" }}>What this place offers</h2>
                
                {amenityGroups.map(group => {
                  const groupItems = group.items.filter(item => allAmenities.has(item.key));
                  if (!groupItems.length) return null;
                  return (
                    <div key={group.title} style={{ marginBottom: "24px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>{group.title}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                        {groupItems.map(item => (
                          <div key={item.key} style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-secondary)", fontSize: "16px" }}>
                            <div style={{ color: "var(--text-primary)" }}>{item.icon}</div> {item.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rooms */}
            <div id="rooms-section">
              <h2 style={{ fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 24px" }}>
                Choose your room
              </h2>

              {/* Date Filter & Room Amenities Filter */}
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "var(--text-primary)" }}>Check Availability</h3>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end", marginBottom: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Check-in</label>
                    <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", outline: "none", color: "var(--text-primary)", background: "var(--bg-primary)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Check-out</label>
                    <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", outline: "none", color: "var(--text-primary)", background: "var(--bg-primary)" }} />
                  </div>
                  <button onClick={handleCheckAvailability} disabled={isCheckingAvailability} style={{ padding: "10px 20px", borderRadius: "8px", background: "var(--accent-color)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, height: "42px", opacity: isCheckingAvailability ? 0.7 : 1 }}>
                    {isCheckingAvailability ? "Checking..." : "Check Availability"}
                  </button>
                  {availableRoomIds !== null && (
                    <button onClick={clearDates} style={{ padding: "10px 20px", borderRadius: "8px", background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-color)", cursor: "pointer", fontWeight: 600, height: "42px" }}>
                      Clear Dates
                    </button>
                  )}
                </div>

                {allAmenities.size > 0 && (
                  <>
                    <h3 style={{ margin: "0 0 16px", fontSize: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "16px", color: "var(--text-primary)" }}>Filter by Room Amenities</h3>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {amenityGroups[0].items.filter(item => allAmenities.has(item.key)).map(item => (
                        <label key={item.key} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", background: selectedRoomAmenities.includes(item.key) ? "rgba(37, 99, 235, 0.1)" : "var(--bg-tertiary)", padding: "6px 12px", borderRadius: "20px", border: selectedRoomAmenities.includes(item.key) ? "1px solid var(--accent-color)" : "1px solid var(--border-color)", color: selectedRoomAmenities.includes(item.key) ? "var(--accent-color)" : "var(--text-secondary)", fontSize: "14px", transition: "all 0.2s" }}>
                          <input type="checkbox" checked={selectedRoomAmenities.includes(item.key)} onChange={() => toggleRoomAmenity(item.key)} style={{ display: "none" }} />
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            {React.cloneElement(item.icon, { size: 16 })} {item.label}
                          </div>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {(() => {
                const filteredRooms = rooms.filter(r => {
                  if (availableRoomIds !== null && !availableRoomIds.includes(r._id)) return false;
                  if (selectedRoomAmenities.length > 0) {
                    const hasAll = selectedRoomAmenities.every(amen => r[amen] === true);
                    if (!hasAll) return false;
                  }
                  return true;
                });

                return (
                  filteredRooms.length === 0 ? (
                    <div style={{ padding: "40px", background: "var(--bg-tertiary)", borderRadius: "16px", color: "var(--text-secondary)", textAlign: "center" }}>
                      <p style={{ margin: 0 }}>No rooms currently available matching your criteria.</p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
                      {filteredRooms.map(room => (
                        <RoomCard
                          key={room._id}
                          room={room}
                          onBook={() => openBookModal(room)}
                        />
                      ))}
                    </div>
                  )
                );
              })()}
            </div>

            {/* Reviews Section */}
            <div id="reviews-section" style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid var(--border-color)" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 24px" }}>
                Guest Reviews
              </h2>
              
              {/* Existing Reviews List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "40px" }}>
                {reviews.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", margin: 0 }}>No reviews yet for this property. Be the first to review!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} style={{ padding: "20px", background: "var(--bg-tertiary)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontWeight: 600 }}>
                          {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p style={{ margin: "0 0 4px", fontWeight: 600, color: "var(--text-primary)" }}>{rev.user?.name || "Anonymous User"}</p>
                          <div style={{ display: "flex", gap: "2px" }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} size={14} fill={star <= rev.rating ? "#fbbf24" : "transparent"} color={star <= rev.rating ? "#fbbf24" : "var(--border-color)"} />
                            ))}
                          </div>
                        </div>
                        <div style={{ marginLeft: "auto", fontSize: "13px", color: "var(--text-tertiary)" }}>
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "15px", whiteSpace: "pre-wrap" }}>
                        {rev.reviewText}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review Form */}
              <div style={{ padding: "24px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px" }}>Write a Review</h3>
                {!currentUser || !currentUser._id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
                    <p style={{ margin: 0, color: "var(--text-secondary)" }}>Please login to share your experience with other guests.</p>
                    <button onClick={() => navigate("/login")} style={{ padding: "10px 20px", background: "var(--accent-color)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
                      Login to Review
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Rating</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", transition: "transform 0.1s" }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                          >
                            <Star size={28} fill={star <= rating ? "#fbbf24" : "transparent"} color={star <= rating ? "#fbbf24" : "var(--border-color)"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="reviewText" style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>Your Experience</label>
                      <textarea
                        id="reviewText"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell us about your stay..."
                        rows="4"
                        style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)", borderRadius: "8px", fontSize: "15px", fontFamily: "inherit", resize: "vertical", outline: "none", transition: "border-color 0.2s" }}
                        onFocus={(e) => e.target.style.borderColor = "var(--accent-color)"}
                        onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      style={{
                        padding: "12px 24px", background: isSubmittingReview ? "var(--text-tertiary)" : "var(--text-primary)", color: "var(--bg-primary)", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "15px", cursor: isSubmittingReview ? "not-allowed" : "pointer", alignSelf: "flex-start", transition: "background 0.2s"
                      }}
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}

function RoomCard({ room, onBook }) {
  const isBooked = room.bookingStatus === "Booked";
  const isMaintenance = room.bookingStatus === "Maintenance";
  
  return (
    <div style={{ 
      background: "var(--bg-secondary)", 
      borderRadius: "16px", 
      border: "1px solid var(--border-color)", 
      overflow: "hidden", 
      boxShadow: "0 4px 12px rgba(0,0,0,0.03)", 
      display: "flex", 
      flexDirection: "column" 
    }}>
      <div style={{ height: "180px", background: "var(--bg-tertiary)", position: "relative" }}>
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
          <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)", fontWeight: 700 }}>{room.roomName}</h3>
          <div style={{ textAlign: "right" }}>
            {room.discount > 0 && (
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "line-through" }}>
                ₹{Math.round(room.price).toLocaleString()}
              </div>
            )}
            <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--accent-color)" }}>
              ₹{Math.round(room.finalPrice || room.price).toLocaleString()}
            </div>
          </div>
        </div>
        
        <p style={{ margin: "0 0 16px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: 500 }}>
          {room.roomType} · {room.bedType || "Standard"} Bed · Max {room.maxGuests || room.adults || 2} Guests
        </p>
        
        <div style={{ marginTop: "auto", display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "4px" }}>Status</label>
            <div style={{ 
              width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "13px", fontWeight: 600,
              background: isBooked ? 'rgba(59, 130, 246, 0.1)' : isMaintenance ? 'rgba(217, 119, 6, 0.1)' : 'rgba(22, 163, 74, 0.1)',
              color: isBooked ? '#2563eb' : isMaintenance ? '#d97706' : '#16a34a',
            }}>
              {isBooked ? "Booked" : isMaintenance ? "Maintenance" : "Available"}
            </div>
          </div>
          
          <button 
            onClick={onBook}
            style={{ 
              flex: 1, height: "37px", marginTop: "17px", padding: "0", 
              background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", 
              borderRadius: "8px", color: "var(--text-primary)", fontWeight: 600, 
              fontSize: "13px", cursor: "pointer", transition: "all 0.2s" 
            }}
            onMouseOver={(e) => e.currentTarget.style.filter = "brightness(0.95)"}
            onMouseOut={(e) => e.currentTarget.style.filter = "none"}
          >
            View & Book
          </button>
        </div>
      </div>
    </div>
  );
}
