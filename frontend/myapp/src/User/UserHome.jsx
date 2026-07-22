import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import URL from "../api";
import bannerImage from "../assets/banner.jpg";
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

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        // minHeight: "88vh",
        // //  background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)",

        // display: "flex", flexDirection: "column", alignItems: "center",
        // justifyContent: "center", padding: "80px 5% 60px",
        // position: "relative", overflow: "hidden"



        minHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // padding: "80px 5% 60px",
        position: "relative",
        overflow: "hidden",

        backgroundImage: `
linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)),
url(${bannerImage})
`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", width: "600px", height: "600px", borderRadius: "50%",
          background: "rgba(139,92,246,0.15)", top: "-200px", right: "-200px",
          filter: "blur(80px)"
        }} />
        <div style={{
          position: "absolute", width: "400px", height: "400px", borderRadius: "50%",
          background: "rgba(99,102,241,0.2)", bottom: "-100px", left: "-100px",
          filter: "blur(60px)"
        }} />

        <div style={{ position: "relative", textAlign: "center", maxWidth: "750px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "100px", padding: "8px 18px", marginBottom: "24px",
            backdropFilter: "blur(10px)"
          }}>
            <span style={{ fontSize: "16px" }}>✨</span>
            <span style={{ color: "#c7d2fe", fontSize: "13px", fontWeight: 600 }}>
              Discover & Book Premium Hotels
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, color: "#fff",
            margin: "0 0 20px", lineHeight: 1.1, letterSpacing: "-2px"
          }}>
            Find Your Perfect
            <span style={{
              display: "block",
              background: "linear-gradient(135deg, #a5b4fc, #f0abfc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              Stay Tonight
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2vw, 18px)", color: "#c7d2fe",
            margin: "0 0 48px", lineHeight: 1.7, maxWidth: "550px", margin: "0 auto 48px"
          }}>
            Browse thousands of hotels, filter by location, amenities, and price. Book instantly with our seamless experience.
          </p>

          {/* Search Bar */}
          <div style={{
            display: "flex", background: "#fff", borderRadius: "16px",
            padding: "8px 8px 8px 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            gap: "10px", maxWidth: "600px", margin: "0 auto 48px"
          }}>
            <span style={{ display: "flex", alignItems: "center", fontSize: "20px" }}>🔍</span>
            <input
              type="text"
              placeholder="Search by hotel name, city, or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{
                flex: 1, border: "none", outline: "none",
                fontSize: "15px", color: "#1e293b", background: "transparent"
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: "14px 28px", borderRadius: "12px", border: "none",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontWeight: 700, fontSize: "15px",
                cursor: "pointer", whiteSpace: "nowrap",
                boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
                transition: "transform 0.2s"
              }}
            >
              Search
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap" }}>
            {[
              { label: "Hotels", value: `${hotels.length}+` },
              { label: "Cities", value: "50+" },
              { label: "Happy Guests", value: "10K+" },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#fff" }}>{stat.value}</div>
                <div style={{ fontSize: "13px", color: "#c7d2fe", fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Amenity Filter Pills */}
      <div style={{ padding: "48px 5% 0", background: "#fff" }}>
        <h2 style={{ textAlign: "center", fontSize: "28px", fontWeight: 800, color: "#1e293b", margin: "0 0 8px" }}>
          Browse by Facilities
        </h2>
        <p style={{ textAlign: "center", color: "#64748b", margin: "0 0 32px", fontSize: "15px" }}>
          Filter hotels by what matters most to you
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
          {[
            { icon: "🏊", label: "Swimming Pool", key: "swimmingPool" },
            { icon: "💪", label: "Gym", key: "gym" },
            { icon: "🧖", label: "Spa", key: "spa" },
            { icon: "🍽️", label: "Restaurant", key: "restaurant" },
            { icon: "🅿️", label: "Parking", key: "parking" },
            { icon: "📶", label: "Free WiFi", key: "wifi" },
            { icon: "❄️", label: "AC Rooms", key: "ac" },
            { icon: "🐾", label: "Pet Friendly", key: "pets" },
          ].map(fac => (
            <button
              key={fac.key}
              onClick={() => navigate(`/user/hotels?facility=${fac.key}`)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 20px", borderRadius: "100px",
                border: "2px solid #e2e8f0", background: "#f8faff",
                color: "#475569", fontWeight: 600, fontSize: "14px",
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.color = "#6366f1";
                e.currentTarget.style.background = "#eef2ff";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.background = "#f8faff";
              }}
            >
              <span style={{ fontSize: "18px" }}>{fac.icon}</span>
              {fac.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Hotels */}
      <div style={{ padding: "60px 5%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1e293b", margin: "0 0 6px" }}>Featured Hotels</h2>
            <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>Top-rated stays curated for you</p>
          </div>
          <button
            onClick={() => navigate("/user/hotels")}
            style={{
              padding: "11px 24px", borderRadius: "10px", border: "2px solid #6366f1",
              background: "transparent", color: "#6366f1", fontWeight: 700,
              fontSize: "14px", cursor: "pointer"
            }}
          >
            View All Hotels →
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                flex: "1 1 300px", height: "360px", borderRadius: "20px",
                background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite"
              }} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "16px" }}>
            No hotels available yet. Check back soon!
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
            {featured.map(hotel => (
              <HotelCard key={hotel._id} hotel={hotel} navigate={navigate} />
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div style={{
        margin: "0 5% 80px",
        background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
        borderRadius: "24px", padding: "60px 48px",
        textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", width: "300px", height: "300px", borderRadius: "50%",
          background: "rgba(255,255,255,0.08)", top: "-100px", right: "-50px"
        }} />
        <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#fff", margin: "0 0 16px" }}>
          Ready to Explore?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "17px", margin: "0 0 32px" }}>
          Browse all our hotels and find your perfect stay with filters for location, price, and amenities.
        </p>
        <button
          onClick={() => navigate("/user/hotels")}
          style={{
            padding: "16px 40px", borderRadius: "14px", border: "none",
            background: "#fff", color: "#6366f1", fontWeight: 800,
            fontSize: "16px", cursor: "pointer", boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            transition: "transform 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          Browse All Hotels 🏨
        </button>
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
      style={{
        borderRadius: "20px", overflow: "hidden", background: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)", transition: "all 0.3s",
        cursor: "pointer"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)";
      }}
      onClick={() => navigate(`/user/hotel/${hotel._id}`)}
    >
      <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
        <img
          src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
          alt={hotel.hotelName}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        />
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff", padding: "5px 12px", borderRadius: "100px",
          fontSize: "12px", fontWeight: 700
        }}>
          ✅ Active
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 700, color: "#1e293b" }}>
          {hotel.hotelName}
        </h3>
        <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
          📍 {city}
        </p>
        <p style={{
          margin: "0 0 16px", color: "#94a3b8", fontSize: "13px",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden"
        }}>
          {hotel.description}
        </p>

        <button
          onClick={e => { e.stopPropagation(); navigate(`/user/hotel/${hotel._id}`); }}
          style={{
            width: "100%", padding: "12px", borderRadius: "12px", border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", fontWeight: 700, fontSize: "14px",
            cursor: "pointer", transition: "opacity 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          View Rooms & Book Now
        </button>
      </div>
    </div>
  );
}
