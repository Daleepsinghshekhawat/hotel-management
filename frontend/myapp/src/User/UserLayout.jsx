import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Map, User, LogIn, Menu, X, Hotel, Sun, Moon } from "lucide-react";
import useTheme from "../useTheme";

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", path: "/user" },
    { label: "Hotels", path: "/user/hotels" },
    { label: "About Us", path: "/user/about" },
    { label: "My Bookings", path: "/user/account/bookings" },
  ];

  const token = localStorage.getItem("token");

  const handleAuthAction = () => {
    if (token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } else {
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;
  
  const isHome = location.pathname === "/user";

  const navBackground = scrolled ? "var(--bg-secondary)" : isHome ? "transparent" : "var(--bg-secondary)";
  const textColor = (scrolled || !isHome) ? "var(--text-primary)" : "#fff";
  const borderColor = (scrolled || !isHome) ? "var(--border-color)" : "rgba(255,255,255,0.2)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: navBackground,
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--border-color)" : "transparent"}`,
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
              background: "var(--accent-color)",
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
                    background: isActive(link.path) ? "var(--input-bg)" : "transparent",
                    color: isActive(link.path) ? "var(--accent-color)" : textColor,
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
              onClick={toggleTheme}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "40px", height: "40px", borderRadius: "50%",
                background: "transparent", border: "none",
                color: textColor, cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(128,128,128,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              onClick={handleAuthAction}
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
              {token ? "Logout" : "Login"}
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
        background: "var(--bg-tertiary)", borderTop: "1px solid var(--border-color)", padding: "60px 5% 40px",
        marginTop: "80px", color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px", marginBottom: "40px" }}>
          
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Map size={28} color="var(--accent-color)" strokeWidth={2.5} />
              <span style={{ fontWeight: 800, fontSize: "24px", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>StayEase</span>
            </div>
            <p style={{ margin: "0 0 20px", fontSize: "15px", lineHeight: "1.6" }}>
              Discover your perfect stay anywhere in the world. Book premium hotels effortlessly with StayEase.
            </p>
          </div>

          <div>
            <h4 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "16px", marginBottom: "20px" }}>Company</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "15px" }}>
              <span style={{ cursor: "pointer" }} onClick={() => navigate("/user/about")}>About Us</span>
              <span style={{ cursor: "pointer" }}>Careers</span>
              <span style={{ cursor: "pointer" }}>Investors</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "16px", marginBottom: "20px" }}>Support</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "15px" }}>
              <span style={{ cursor: "pointer" }}>Help Center</span>
              <span style={{ cursor: "pointer" }}>Safety Information</span>
              <span style={{ cursor: "pointer" }}>Cancellation Options</span>
            </div>
          </div>

        </div>
        
        <div style={{ maxWidth: "1400px", margin: "0 auto", borderTop: "1px solid var(--border-color)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
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
