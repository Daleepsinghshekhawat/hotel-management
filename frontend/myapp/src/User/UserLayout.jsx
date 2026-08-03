import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Map, User, LogIn, Menu, X, Hotel } from "lucide-react";

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", path: "/user" },
    { label: "Hotels", path: "/user/hotels" },
    { label: "My Bookings", path: "/user/account/bookings" },
  ];

  const isActive = (path) => location.pathname === path;
  
  // Checking if we are on the exact homepage, since the homepage hero is very large and might want a transparent nav
  const isHome = location.pathname === "/user";

  const navBackground = scrolled ? "rgba(255,255,255,0.95)" : isHome ? "transparent" : "#fff";
  const textColor = (scrolled || !isHome) ? "#0f172a" : "#fff";
  const borderColor = (scrolled || !isHome) ? "#e2e8f0" : "rgba(255,255,255,0.2)";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: navBackground,
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: `1px solid ${scrolled ? "#e2e8f0" : "transparent"}`,
        transition: "all 0.3s ease",
        padding: "0 5%",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "80px", maxWidth: "1400px", margin: "0 auto" }}>
          
          {/* Logo */}
          <div
            onClick={() => navigate("/user")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "#2563eb",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff"
            }}>
              <Map size={24} strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 800, fontSize: "24px", color: textColor, letterSpacing: "-0.5px" }}>
              StayEase
            </span>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  style={{
                    padding: "8px 16px", borderRadius: "20px", border: "none",
                    background: isActive(link.path) ? "rgba(37, 99, 235, 0.1)" : "transparent",
                    color: isActive(link.path) ? "#2563eb" : textColor,
                    fontWeight: 600, fontSize: "15px", cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
            
            <div style={{ width: "1px", height: "24px", background: borderColor }} />

            <button
              onClick={() => navigate("/login")}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 20px", borderRadius: "30px", border: `1px solid ${borderColor}`,
                background: "transparent",
                color: textColor,
                fontWeight: 600, fontSize: "15px", cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div style={{ paddingTop: isHome ? "0" : "80px" }}>
        <Outlet />
      </div>

      {/* Modern Footer */}
      <footer style={{
        background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "60px 5% 40px",
        marginTop: "80px", color: "#475569", fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px", marginBottom: "40px" }}>
          
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Map size={28} color="#2563eb" strokeWidth={2.5} />
              <span style={{ fontWeight: 800, fontSize: "24px", color: "#0f172a", letterSpacing: "-0.5px" }}>StayEase</span>
            </div>
            <p style={{ margin: "0 0 20px", fontSize: "15px", lineHeight: "1.6" }}>
              Discover your perfect stay anywhere in the world. Book premium hotels effortlessly with StayEase.
            </p>
          </div>

          <div>
            <h4 style={{ color: "#0f172a", fontWeight: 700, fontSize: "16px", marginBottom: "20px" }}>Company</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "15px" }}>
              <span style={{ cursor: "pointer" }}>About Us</span>
              <span style={{ cursor: "pointer" }}>Careers</span>
              <span style={{ cursor: "pointer" }}>Investors</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: "#0f172a", fontWeight: 700, fontSize: "16px", marginBottom: "20px" }}>Support</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "15px" }}>
              <span style={{ cursor: "pointer" }}>Help Center</span>
              <span style={{ cursor: "pointer" }}>Safety Information</span>
              <span style={{ cursor: "pointer" }}>Cancellation Options</span>
            </div>
          </div>

        </div>
        
        <div style={{ maxWidth: "1400px", margin: "0 auto", borderTop: "1px solid #e2e8f0", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <p style={{ margin: 0, fontSize: "14px" }}>© 2026 StayEase, Inc. All rights reserved.</p>
          <div style={{ display: "flex", gap: "20px", fontSize: "14px", fontWeight: 500 }}>
            <span style={{ cursor: "pointer" }}>Privacy</span>
            <span style={{ cursor: "pointer" }}>Terms</span>
            <span style={{ cursor: "pointer" }}>Sitemap</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
