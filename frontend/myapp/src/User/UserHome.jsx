import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, MapPin, Star, Waves, Dumbbell, Sparkles, Utensils, ParkingCircle, Wifi, Wind, Dog, ChevronRight, ChevronLeft, ShieldCheck, Clock, CheckCircle, Mail } from "lucide-react";
import URL from "../api";

export default function UserHome() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const celebrationEvents = [
    {
      title: "Dream Weddings",
      desc: "Make your special day unforgettable in our luxury hotel venues.",
      img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200"
    },
    {
      title: "Corporate Retreats",
      desc: "Host flawless meetings and retreats with our business packages.",
      img: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200"
    },
    {
      title: "Gala Dinners",
      desc: "Elegant ballrooms designed for large-scale formal events.",
      img: "https://images.unsplash.com/photo-1519671482749-fd0987c2b291?w=1200"
    }
  ];

  useEffect(() => {
    axios.get(`${URL}/api/getHotelsByStatus/active`)
      .then(res => setHotels(res.data.result || []))
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = hotels.slice(0, 8);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/user/hotels?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/user/hotels");
    }
  };

  const facilities = [
    { icon: <Waves size={28} strokeWidth={1.5} />, label: "Pool", key: "swimmingPool" },
    { icon: <Dumbbell size={28} strokeWidth={1.5} />, label: "Gym", key: "gym" },
    { icon: <Sparkles size={28} strokeWidth={1.5} />, label: "Spa", key: "spa" },
    { icon: <Utensils size={28} strokeWidth={1.5} />, label: "Dining", key: "restaurant" },
    { icon: <ParkingCircle size={28} strokeWidth={1.5} />, label: "Parking", key: "parking" },
    { icon: <Wifi size={28} strokeWidth={1.5} />, label: "WiFi", key: "wifi" },
    { icon: <Wind size={28} strokeWidth={1.5} />, label: "AC", key: "ac" },
    { icon: <Dog size={28} strokeWidth={1.5} />, label: "Pets", key: "pets" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#050505", color: "#fff", minHeight: "100vh" }}>
      
      {/* Hero Section */}
      <div style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(to bottom, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.9) 100%), url('/hero_1.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div style={{ textAlign: "center", zIndex: 1, padding: "0 20px", marginTop: "-10vh" }}>
          <h1 style={{ 
            fontSize: "clamp(48px, 8vw, 96px)", 
            fontWeight: 800, 
            color: "#fff", 
            margin: "0 0 16px", 
            letterSpacing: "-2px",
            lineHeight: 1.1,
            textShadow: "0 10px 30px rgba(0,0,0,0.8)"
          }}>
            Experience <span style={{ color: "#eab308" }}>Ultimate</span> Luxury
          </h1>
          <p style={{ 
            fontSize: "clamp(18px, 2.5vw, 24px)", 
            color: "#e4e4e7", 
            margin: "0 0 56px", 
            fontWeight: 300,
            textShadow: "0 5px 15px rgba(0,0,0,0.8)"
          }}>
            Discover breathtaking stays crafted for the elite traveler.
          </p>
        </div>

        {/* Floating Glassmorphism Search Bar */}
        <div style={{
          position: "absolute",
          bottom: "10%",
          width: "90%",
          maxWidth: "900px",
          background: "rgba(15, 15, 15, 0.4)",
          backdropFilter: "blur(20px)",
          borderRadius: "100px",
          padding: "12px",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          border: "1px solid rgba(234, 179, 8, 0.3)"
        }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 24px" }}>
            <MapPin size={24} color="#eab308" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Where is your next escape?"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: "18px",
                fontWeight: 400,
                color: "#fff",
                padding: "16px",
                background: "transparent",
                caretColor: "#eab308"
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            style={{
              padding: "18px 48px",
              borderRadius: "100px",
              border: "none",
              background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
              color: "#050505",
              fontWeight: 800,
              fontSize: "16px",
              cursor: "pointer",
              transition: "transform 0.3s, box-shadow 0.3s"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(234,179,8,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Explore
          </button>
        </div>
      </div>

      {/* Facilities Categories */}
      <div style={{ maxWidth: "1400px", margin: "100px auto 80px", padding: "0 5%" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 300, color: "#fff", margin: "0 0 40px", letterSpacing: "1px", textAlign: "center" }}>Curate Your Stay</h2>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
          gap: "24px" 
        }}>
          {facilities.map((fac) => (
            <div 
              key={fac.key}
              onClick={() => navigate(`/user/hotels?facility=${fac.key}`)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                padding: "32px 16px",
                borderRadius: "24px",
                background: "#0a0a0c",
                border: "1px solid #1f1f22",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#eab308";
                e.currentTarget.style.background = "#111115";
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(234,179,8,0.15)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#1f1f22";
                e.currentTarget.style.background = "#0a0a0c";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
              }}
            >
              <div style={{ color: "#eab308" }}>{fac.icon}</div>
              <span style={{ fontSize: "15px", fontWeight: 500, color: "#e4e4e7", letterSpacing: "0.5px" }}>{fac.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Hotels */}
      <div style={{ maxWidth: "1400px", margin: "0 auto 120px", padding: "0 5%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
          <div>
            <h2 style={{ fontSize: "36px", fontWeight: 300, color: "#fff", margin: "0 0 12px", letterSpacing: "1px" }}>Trending Destinations</h2>
            <p style={{ color: "#a1a1aa", margin: 0, fontSize: "16px", fontWeight: 300 }}>Exclusive selections favored by our discerning guests</p>
          </div>
          <button
            onClick={() => navigate("/user/hotels")}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 24px", borderRadius: "100px", border: "1px solid rgba(234, 179, 8, 0.5)",
              background: "transparent", color: "#eab308", fontWeight: 600,
              fontSize: "15px", cursor: "pointer", transition: "all 0.3s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(234, 179, 8, 0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            Explore All <ChevronRight size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px" }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: "400px", borderRadius: "24px",
                background: "linear-gradient(90deg, #111 25%, #222 50%, #111 75%)",
                backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite"
              }} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#a1a1aa", fontSize: "18px", fontWeight: 300 }}>
            No exclusive properties available right now.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "32px" }}>
            {featured.map(hotel => (
              <HotelCard key={hotel._id} hotel={hotel} navigate={navigate} />
            ))}
          </div>
        )}
      </div>

      {/* Special Offers Section */}
      <div style={{ maxWidth: "1400px", margin: "0 auto 120px", padding: "0 5%" }}>
        <div style={{
          position: "relative",
          borderRadius: "32px",
          padding: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "40px",
          boxShadow: "0 30px 60px rgba(0,0,0,0.8)",
          overflow: "hidden",
          backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 100%), url('/hero_2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "1px solid rgba(234,179,8,0.2)"
        }}>
          <div style={{ flex: "1 1 400px", color: "#fff", zIndex: 2 }}>
            <div style={{ color: "#eab308", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px", fontSize: "14px" }}>Exclusive Membership</div>
            <h2 style={{ fontSize: "48px", fontWeight: 300, margin: "0 0 24px", lineHeight: 1.1, letterSpacing: "-1px" }}>Unlock 15% off your first luxury stay</h2>
            <p style={{ fontSize: "18px", margin: "0 0 40px", color: "#e4e4e7", fontWeight: 300, lineHeight: 1.6 }}>Sign up for our exclusive circle and apply the code <strong style={{ color: "#eab308" }}>WELCOME15</strong> at checkout to claim your privileged discount.</p>
            <button
              onClick={() => navigate("/signup")}
              style={{
                padding: "16px 40px",
                borderRadius: "100px",
                border: "none",
                background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
                color: "#050505",
                fontWeight: 800,
                fontSize: "16px",
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(234,179,8,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              Claim Offer
            </button>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div style={{ padding: "100px 0", borderTop: "1px solid #111", borderBottom: "1px solid #111", background: "#080808" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 5%" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "36px", fontWeight: 300, color: "#fff", margin: "0 0 16px", letterSpacing: "1px" }}>The StayEase Standard</h2>
            <p style={{ fontSize: "18px", color: "#a1a1aa", margin: 0, fontWeight: 300 }}>We redefine hospitality with impeccable service and security.</p>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px" }}>
            <div style={{ background: "#0a0a0c", padding: "40px", borderRadius: "24px", textAlign: "center", border: "1px solid #1f1f22", transition: "transform 0.4s", cursor: "default" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-10px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ background: "rgba(234, 179, 8, 0.1)", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#eab308" }}>
                <ShieldCheck size={40} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 400, margin: "0 0 16px", color: "#fff" }}>Unmatched Security</h3>
              <p style={{ color: "#a1a1aa", fontSize: "15px", lineHeight: 1.8, margin: 0, fontWeight: 300 }}>Your peace of mind is our priority. Every transaction is encrypted and every booking is fully protected.</p>
            </div>
            
            <div style={{ background: "#0a0a0c", padding: "40px", borderRadius: "24px", textAlign: "center", border: "1px solid #1f1f22", transition: "transform 0.4s", cursor: "default" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-10px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ background: "rgba(234, 179, 8, 0.1)", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#eab308" }}>
                <CheckCircle size={40} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 400, margin: "0 0 16px", color: "#fff" }}>Flexible Elegance</h3>
              <p style={{ color: "#a1a1aa", fontSize: "15px", lineHeight: 1.8, margin: 0, fontWeight: 300 }}>Plans change. That's why we offer complimentary cancellation on premium suites up to 24 hours before arrival.</p>
            </div>
            
            <div style={{ background: "#0a0a0c", padding: "40px", borderRadius: "24px", textAlign: "center", border: "1px solid #1f1f22", transition: "transform 0.4s", cursor: "default" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-10px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{ background: "rgba(234, 179, 8, 0.1)", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#eab308" }}>
                <Clock size={40} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 400, margin: "0 0 16px", color: "#fff" }}>24/7 Concierge</h3>
              <p style={{ color: "#a1a1aa", fontSize: "15px", lineHeight: 1.8, margin: 0, fontWeight: 300 }}>Our global elite support team is ready to assist you anytime, anywhere, catering to your every need.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div style={{ maxWidth: "1400px", margin: "120px auto", padding: "0 5%" }}>
        <h2 style={{ fontSize: "36px", fontWeight: 300, color: "#fff", textAlign: "center", margin: "0 0 60px", letterSpacing: "1px" }}>Words from Our Guests</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
          
          <div style={{ padding: "40px", borderRadius: "24px", background: "#0a0a0c", border: "1px solid #1f1f22", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", gap: "6px", color: "#eab308", marginBottom: "24px" }}>
              <Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} />
            </div>
            <p style={{ fontSize: "17px", color: "#e4e4e7", fontStyle: "italic", lineHeight: 1.8, margin: "0 0 32px", fontWeight: 300 }}>
              "An absolutely transcendental experience. The attention to detail and sheer luxury of the suite exceeded every expectation I had."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#222" }}>
                <img src="https://i.pravatar.cc/150?img=47" alt="User" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px", color: "#fff", letterSpacing: "0.5px" }}>Sarah Jenkins</div>
                <div style={{ fontSize: "13px", color: "#eab308" }}>Platinum Member</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "40px", borderRadius: "24px", background: "#0a0a0c", border: "1px solid #1f1f22", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", gap: "6px", color: "#eab308", marginBottom: "24px" }}>
              <Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} />
            </div>
            <p style={{ fontSize: "17px", color: "#e4e4e7", fontStyle: "italic", lineHeight: 1.8, margin: "0 0 32px", fontWeight: 300 }}>
              "From the moment we arrived, we were treated like royalty. The exclusive views and impeccable dining options made our anniversary perfect."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#222" }}>
                <img src="https://i.pravatar.cc/150?img=11" alt="User" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px", color: "#fff", letterSpacing: "0.5px" }}>David Chen</div>
                <div style={{ fontSize: "13px", color: "#eab308" }}>Toronto, Canada</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "40px", borderRadius: "24px", background: "#0a0a0c", border: "1px solid #1f1f22", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", gap: "6px", color: "#eab308", marginBottom: "24px" }}>
              <Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} /><Star size={20} fill="currentColor" strokeWidth={0} />
            </div>
            <p style={{ fontSize: "17px", color: "#e4e4e7", fontStyle: "italic", lineHeight: 1.8, margin: "0 0 32px", fontWeight: 300 }}>
              "The booking platform is as gorgeous as the properties themselves. Effortless, premium, and thoroughly refined. Highly recommended."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#222" }}>
                <img src="https://i.pravatar.cc/150?img=32" alt="User" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "15px", color: "#fff", letterSpacing: "0.5px" }}>Emily Rostova</div>
                <div style={{ fontSize: "13px", color: "#eab308" }}>Sydney, Australia</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Newsletter Signup */}
      <div style={{ background: "#0a0a0c", padding: "100px 0", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 5%", textAlign: "center" }}>
          <div style={{ background: "rgba(234, 179, 8, 0.1)", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px" }}>
            <Mail size={40} color="#eab308" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: "36px", fontWeight: 300, margin: "0 0 16px", color: "#fff", letterSpacing: "1px" }}>Join the Inner Circle</h2>
          <p style={{ fontSize: "18px", color: "#a1a1aa", margin: "0 0 40px", fontWeight: 300 }}>Subscribe to receive private invitations to exclusive estates and bespoke offers.</p>
          
          <form onSubmit={(e) => { e.preventDefault(); alert("Welcome to the Inner Circle!"); }} style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
              style={{
                flex: "1 1 300px",
                padding: "20px 32px",
                borderRadius: "100px",
                border: "1px solid rgba(234, 179, 8, 0.3)",
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                fontSize: "16px",
                outline: "none",
                caretColor: "#eab308"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "20px 48px",
                borderRadius: "100px",
                border: "none",
                background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
                color: "#050505",
                fontWeight: 800,
                fontSize: "16px",
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(234,179,8,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              Subscribe
            </button>
          </form>
          <p style={{ fontSize: "13px", color: "#555", marginTop: "24px", letterSpacing: "0.5px" }}>We respect your privacy. Excellence is our standard.</p>
        </div>
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
        cursor: "pointer", 
        display: "flex", 
        flexDirection: "column", 
        gap: "16px",
        background: "#0a0a0c",
        padding: "16px",
        borderRadius: "24px",
        border: "1px solid #1f1f22",
        transition: "all 0.4s",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
      }}
      onClick={() => navigate(`/user/hotel/${hotel._id}`)}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.borderColor = "#eab308";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(234,179,8,0.15)";
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = "scale(1.08)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#1f1f22";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = "scale(1)";
      }}
    >
      <div style={{ position: "relative", aspectRatio: "4/3", borderRadius: "16px", overflow: "hidden" }}>
        <img
          src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
          alt={hotel.hotelName}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
        <div style={{ 
          position: "absolute", 
          top: "16px", 
          right: "16px", 
          background: "rgba(10,10,12,0.8)", 
          backdropFilter: "blur(10px)",
          padding: "6px 12px", 
          borderRadius: "10px", 
          display: "flex", 
          alignItems: "center", 
          gap: "6px", 
          fontSize: "14px", 
          fontWeight: 700, 
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <Star size={16} fill="#eab308" color="#eab308" strokeWidth={0} /> 4.9
        </div>
      </div>

      <div style={{ padding: "0 8px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 400, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: "10px", letterSpacing: "0.5px" }}>
            {hotel.hotelName}
          </h3>
        </div>
        <p style={{ margin: "0 0 16px", color: "#a1a1aa", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 300 }}>
          <MapPin size={14} color="#eab308" /> {city}
        </p>
        <p style={{ margin: 0, fontSize: "14px", color: "#eab308", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
          Available Tonight
        </p>
      </div>
    </div>
  );
}
