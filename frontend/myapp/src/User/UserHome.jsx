import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, MapPin, Star, Waves, Dumbbell, Sparkles, Utensils, ParkingCircle, Wifi, Wind, Dog, ChevronRight } from "lucide-react";
import URL from "../api";

// Use a high-quality Unsplash image for the hero banner instead of the local asset
const bannerImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600";

export default function UserHome() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${URL}/api/getHotelsByStatus/active`)
      .then(res => setHotels(res.data.result || []))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = hotels.slice(0, 6);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/user/hotels?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/user/hotels");
    }
  };

  const facilities = [
    { icon: <Waves size={24} strokeWidth={1.5} />, label: "Pool", key: "swimmingPool" },
    { icon: <Dumbbell size={24} strokeWidth={1.5} />, label: "Gym", key: "gym" },
    { icon: <Sparkles size={24} strokeWidth={1.5} />, label: "Spa", key: "spa" },
    { icon: <Utensils size={24} strokeWidth={1.5} />, label: "Dining", key: "restaurant" },
    { icon: <ParkingCircle size={24} strokeWidth={1.5} />, label: "Parking", key: "parking" },
    { icon: <Wifi size={24} strokeWidth={1.5} />, label: "WiFi", key: "wifi" },
    { icon: <Wind size={24} strokeWidth={1.5} />, label: "AC", key: "ac" },
    { icon: <Dog size={24} strokeWidth={1.5} />, label: "Pets", key: "pets" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Section */}
      <div style={{
        minHeight: "90vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%), url('${bannerImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div style={{ textAlign: "center", zIndex: 1, padding: "0 20px" }}>
          <h1 style={{ 
            fontSize: "clamp(42px, 6vw, 72px)", 
            fontWeight: 800, 
            color: "#fff", 
            margin: "0 0 16px", 
            letterSpacing: "-1.5px",
            lineHeight: 1.1
          }}>
            Find your next stay
          </h1>
          <p style={{ 
            fontSize: "clamp(16px, 2vw, 20px)", 
            color: "#f8fafc", 
            margin: "0 0 48px", 
            fontWeight: 400 
          }}>
            Search low prices on hotels, homes and much more...
          </p>
        </div>

        {/* Floating Search Bar */}
        <div style={{
          position: "absolute",
          bottom: "-32px",
          width: "90%",
          maxWidth: "860px",
          background: "var(--bg-secondary)",
          borderRadius: "100px",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          border: "1px solid var(--border-color)"
        }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 24px" }}>
            <MapPin size={24} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Where are you going?"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: "16px",
                fontWeight: 500,
                color: "var(--text-primary)",
                padding: "16px",
                background: "transparent"
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            style={{
              padding: "16px 40px",
              borderRadius: "100px",
              border: "none",
              background: "var(--accent-color)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              cursor: "pointer",
              transition: "opacity 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Search
          </button>
        </div>
      </div>

      {/* Facilities Categories */}
      <div style={{ maxWidth: "1400px", margin: "100px auto 60px", padding: "0 5%" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 32px" }}>Browse by property type</h2>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", 
          gap: "16px" 
        }}>
          {facilities.map((fac) => (
            <div 
              key={fac.key}
              onClick={() => navigate(`/user/hotels?facility=${fac.key}`)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                padding: "24px 16px",
                borderRadius: "16px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--accent-color)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(37,99,235,0.1)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.02)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ color: "var(--text-secondary)" }}>{fac.icon}</div>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{fac.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Hotels */}
      <div style={{ maxWidth: "1400px", margin: "0 auto 80px", padding: "0 5%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>Trending destinations</h2>
            <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "16px" }}>Most popular choices for travelers from India</p>
          </div>
          <button
            onClick={() => navigate("/user/hotels")}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "10px 20px", borderRadius: "100px", border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 600,
              fontSize: "14px", cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--bg-secondary)"}
          >
            Explore All <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: "360px", borderRadius: "16px",
                background: "linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-color) 50%, var(--bg-tertiary) 75%)",
                backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite"
              }} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)", fontSize: "16px" }}>
            No hotels available right now.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {featured.map(hotel => (
              <HotelCard key={hotel._id} hotel={hotel} navigate={navigate} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

function HotelCard({ hotel, navigate }) {
  const location = hotel.location;
  const city = typeof location === "object"
    ? [location?.cityname, location?.district?.districtname, location?.state?.Statename].filter(Boolean).join(", ")
    : location || "N/A";

  return (
    <div
      style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "12px" }}
      onClick={() => navigate(`/user/hotel/${hotel._id}`)}
      onMouseEnter={e => {
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = "scale(1.05)";
      }}
      onMouseLeave={e => {
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = "scale(1)";
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4/3", borderRadius: "16px", overflow: "hidden" }}>
        <img
          src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
          alt={hotel.hotelName}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
        />
        <div style={{ position: "absolute", top: "12px", right: "12px", background: "var(--bg-secondary)", padding: "4px 8px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
          <Star size={14} fill="#eab308" color="#eab308" /> 4.8
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: "10px" }}>
            {hotel.hotelName}
          </h3>
        </div>
        <p style={{ margin: "0 0 8px", color: "var(--text-secondary)", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
          {city}
        </p>
        <p style={{ margin: 0, fontSize: "15px", color: "var(--text-primary)" }}>
          <span style={{ fontWeight: 700 }}>Available Tonight</span>
        </p>
      </div>
    </div>
  );
}
