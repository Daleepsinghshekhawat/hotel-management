import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

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

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        boxShadow: scrolled ? "0 2px 30px rgba(0,0,0,0.1)" : "none",
        transition: "all 0.3s ease",
        padding: "0 5%",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "70px" }}>
          {/* Logo */}
          <div
            onClick={() => navigate("/user")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", boxShadow: "0 4px 15px rgba(99,102,241,0.4)"
            }}>🏨</div>
            <span style={{ fontWeight: 800, fontSize: "20px", color: scrolled ? "#1e293b" : "#fff", letterSpacing: "-0.5px" }}>
              StayEase
            </span>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  padding: "8px 18px", borderRadius: "8px", border: "none",
                  background: isActive(link.path)
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "transparent",
                  color: isActive(link.path) ? "#fff" : (scrolled ? "#475569" : "#fff"),
                  fontWeight: 600, fontSize: "14px", cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "9px 22px", borderRadius: "10px", border: "2px solid",
                borderColor: scrolled ? "#6366f1" : "#fff",
                background: "transparent",
                color: scrolled ? "#6366f1" : "#fff",
                fontWeight: 700, fontSize: "14px", cursor: "pointer",
                transition: "all 0.2s", marginLeft: "8px"
              }}
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div style={{ paddingTop: "70px" }}>
        <Outlet />
      </div>

      {/* Footer */}
      <footer style={{
        background: "#0f172a", color: "#94a3b8", padding: "40px 5%",
        textAlign: "center", marginTop: "80px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
          <span style={{ fontSize: "24px" }}>🏨</span>
          <span style={{ fontWeight: 800, fontSize: "22px", color: "#fff" }}>StayEase</span>
        </div>
        <p style={{ margin: "0 0 8px", fontSize: "14px" }}>Your perfect stay, every time.</p>
        <p style={{ margin: 0, fontSize: "12px", color: "#475569" }}>© 2026 StayEase. All rights reserved.</p>
      </footer>
    </div>
  );
}
