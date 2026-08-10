import React from "react";
import { Triangle, Wifi, Key, ConciergeBell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050505",
      color: "#ffffff",
      fontFamily: "'Inter', sans-serif",
      padding: "20px 5% 80px", // Reduced top padding from 80px to 20px
      display: "flex",
      flexDirection: "column", // Stack children vertically
      alignItems: "center",
      justifyContent: "flex-start", // Start from the top to reduce the gap
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Subtle background glow */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "30%",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(234, 179, 8, 0.05) 0%, rgba(0,0,0,0) 70%)",
        zIndex: 0,
        pointerEvents: "none"
      }} />

      <div style={{
        maxWidth: "1200px",
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        gap: "60px",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10
      }}>
        
        {/* Left Column */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Logo / Triangle */}
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <Triangle fill="none" color="#eab308" size={32} strokeWidth={1} style={{ transform: "rotate(180deg)", opacity: 0.8 }} />
          </div>

          <h2 style={{
            fontSize: "clamp(36px, 5vw, 54px)",
            fontWeight: 300,
            margin: 0,
            letterSpacing: "1px",
            color: "#ffffff",
          }}>
            About Us
          </h2>

          <p style={{
            color: "#a1a1aa",
            fontSize: "16px",
            lineHeight: "1.9",
            margin: 0,
            maxWidth: "480px"
          }}>
            We offer the finest luxury hotel experiences tailored for the discerning traveler. 
            From breathtaking cityscapes to serene retreats, our properties combine modern elegance 
            with unparalleled hospitality to create truly unforgettable stays.
          </p>

          <div style={{ display: "flex", gap: "48px", marginTop: "24px", marginBottom: "24px" }}>
            <div>
              <div style={{ fontSize: "28px", color: "#eab308", fontWeight: "600", marginBottom: "4px" }}>20+</div>
              <div style={{ fontSize: "11px", color: "#71717a", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600 }}>Properties</div>
            </div>
            <div>
              <div style={{ fontSize: "28px", color: "#eab308", fontWeight: "600", marginBottom: "4px" }}>4.9</div>
              <div style={{ fontSize: "11px", color: "#71717a", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600 }}>Rating</div>
            </div>
            <div>
              <div style={{ fontSize: "28px", color: "#eab308", fontWeight: "600", marginBottom: "4px" }}>150+</div>
              <div style={{ fontSize: "11px", color: "#71717a", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600 }}>Staff</div>
            </div>
          </div>

          <button onClick={() => navigate('/user/hotels')} style={{
            alignSelf: "flex-start",
            padding: "16px 40px",
            borderRadius: "50px",
            background: "#eab308",
            color: "#000",
            fontWeight: "700",
            fontSize: "14px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
            transition: "transform 0.2s, background 0.2s",
            marginTop: "16px",
            boxShadow: "0 10px 20px rgba(234, 179, 8, 0.2)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.background = "#facc15";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.background = "#eab308";
          }}
          >
            Explore
          </button>
        </div>

        {/* Right Column */}
        <div style={{
          flex: "1 1 500px",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          minHeight: "600px"
        }}>
          
          {/* Arched Image Container */}
          <div style={{
            width: "360px",
            height: "580px",
            borderRadius: "200px", // Complete pill shape
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 30px 60px rgba(0,0,0,0.6)", 
            border: "1px solid rgba(234, 179, 8, 0.15)",
            background: "#111" // Fallback color
          }}>
            <img 
              src="https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800" 
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Dark gradient overlay at bottom of image for blending */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "150px",
              background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
            }} />
          </div>

          {/* Floating Amenities aligned on the right */}
          <div style={{
            position: "absolute",
            right: "-20px", // push it slightly out of the box
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            zIndex: 10
          }}>
            {[
              { icon: <Wifi size={18} color="#eab308" />, label: "Free Wifi" },
              { icon: <Key size={18} color="#eab308" />, label: "Smart Key" },
              { icon: <ConciergeBell size={18} color="#eab308" />, label: "Room Service" }
            ].map((item, idx) => (
              <div key={idx} style={{
                background: "rgba(10, 10, 12, 0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(234, 179, 8, 0.2)",
                borderRadius: "16px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 15px 30px rgba(0,0,0,0.5)",
                width: "200px",
                transform: `translateX(${idx === 1 ? '20px' : '0px'})`, // stagger middle item
                transition: "transform 0.3s ease",
                cursor: "default"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = `translateX(${idx === 1 ? '25px' : '5px'}) scale(1.02)`;
                e.currentTarget.style.borderColor = "rgba(234, 179, 8, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `translateX(${idx === 1 ? '20px' : '0px'}) scale(1)`;
                e.currentTarget.style.borderColor = "rgba(234, 179, 8, 0.2)";
              }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "rgba(234, 179, 8, 0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {item.icon}
                </div>
                <span style={{ color: "#e4e4e7", fontSize: "14px", fontWeight: "600", letterSpacing: "0.5px" }}>{item.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* New Gallery Section */}
      <div style={{
        maxWidth: "1200px",
        width: "100%",
        marginTop: "120px",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: "40px"
      }}>
        
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: 300, color: "#fff", margin: "0 0 16px", letterSpacing: "1px" }}>A Glimpse of Elegance</h2>
          <p style={{ color: "#a1a1aa", margin: 0, maxWidth: "600px", marginInline: "auto", lineHeight: "1.8" }}>
            Step inside our world-class suites and soak in breathtaking views. Every detail is meticulously crafted to surround you with absolute comfort and prestige.
          </p>
        </div>

        {/* Gallery Grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "center" }}>
          
          {/* Luxury Room 1 */}
          <div style={{ flex: "1 1 350px", height: "400px", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <img 
              src="/luxury_room_1.jpg" 
              alt="Luxury Room Interior"
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            />
            <div style={{ position: "absolute", bottom: "24px", left: "24px", background: "rgba(10,10,12,0.8)", backdropFilter: "blur(10px)", padding: "12px 20px", borderRadius: "12px", border: "1px solid rgba(234, 179, 8, 0.2)" }}>
              <span style={{ color: "#eab308", fontWeight: 600, fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase" }}>Executive Suite</span>
            </div>
          </div>

          {/* Luxury Room 2 */}
          <div style={{ flex: "1 1 350px", height: "400px", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <img 
              src="/luxury_room_2.jpg" 
              alt="Luxury Suite Living Room"
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            />
            <div style={{ position: "absolute", bottom: "24px", left: "24px", background: "rgba(10,10,12,0.8)", backdropFilter: "blur(10px)", padding: "12px 20px", borderRadius: "12px", border: "1px solid rgba(234, 179, 8, 0.2)" }}>
              <span style={{ color: "#eab308", fontWeight: 600, fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase" }}>Presidential Lounge</span>
            </div>
          </div>

          {/* Hotel View */}
          <div style={{ flex: "1 1 100%", height: "500px", borderRadius: "24px", overflow: "hidden", position: "relative", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            <img 
              src="/hotel_view_1.jpg" 
              alt="Beautiful Sunset View from Balcony"
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            />
            <div style={{ position: "absolute", bottom: "32px", right: "32px", background: "rgba(10,10,12,0.8)", backdropFilter: "blur(10px)", padding: "16px 24px", borderRadius: "12px", border: "1px solid rgba(234, 179, 8, 0.2)", textAlign: "right" }}>
              <div style={{ color: "#eab308", fontWeight: 700, fontSize: "18px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Breathtaking Views</div>
              <div style={{ color: "#e4e4e7", fontSize: "13px" }}>Watch the city come alive from your private balcony.</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
