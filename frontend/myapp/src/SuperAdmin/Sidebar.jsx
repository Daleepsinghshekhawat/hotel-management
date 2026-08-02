import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  Building2, 
  Users, 
  UserCog, 
  Briefcase, 
  BedDouble, 
  MapPin,
  Map,
  Globe,
  Receipt, 
  Tags, 
  MessageSquare, 
  BarChart2, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  ClipboardList,
  PlusSquare,
  UserPlus
} from "lucide-react";

function Sidebar({ theme, toggleTheme }) {
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const navLinkStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    padding: "12px 20px",
    marginBottom: "4px",
    borderRadius: "10px",
    color: isActive ? "#ffffff" : "#94a3b8",
    background: isActive ? "#3b82f6" : "transparent",
    fontWeight: isActive ? 600 : 500,
    fontSize: "14px",
    transition: "all 0.2s ease",
  });

  const links = [
    { to: "/superadmin/dashboard", icon: <Home size={20} />, label: "Dashboard" },
    { to: "/superadmin/approved", icon: <Building2 size={20} />, label: "Hotels" },
    { to: "/superadmin/add-hotel", icon: <PlusSquare size={20} />, label: "Add Hotel" },
    { to: "/superadmin/hotel-requests", icon: <ClipboardList size={20} />, label: "Hotel Requests" },
    { to: "/superadmin/admins/all", icon: <UserCog size={20} />, label: "Admins" },
    { to: "/superadmin/admins/add", icon: <UserPlus size={20} />, label: "Add Admin" },
    { to: "/superadmin/admins/requests", icon: <ClipboardList size={20} />, label: "Admin Requests" },
    { to: "/superadmin/state", icon: <Globe size={20} />, label: "States" },
    { to: "/superadmin/district", icon: <Map size={20} />, label: "Districts" },
    { to: "/superadmin/city", icon: <MapPin size={20} />, label: "Cities" },
    { to: "/superadmin/coupons", icon: <Tags size={20} />, label: "Offers & Coupons" },
    { to: "/superadmin/reviews", icon: <MessageSquare size={20} />, label: "Reviews" },
    { to: "/superadmin/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <div
      style={{
        width: "260px",
        height: "100vh",
        background: "#0f172a",
        color: "#f8fafc",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
        <div style={{ padding: "10px", marginBottom: "30px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(59, 130, 246, 0.4)"
          }}>
            <UserCog size={20} color="#fff" />
          </div>
          <span style={{
            fontSize: "20px",
            fontWeight: 800,
            background: "linear-gradient(to right, #ffffff, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "1px",
            textTransform: "uppercase"
          }}>
            Superadmin
          </span>
        </div>

        {links.map((link, idx) => (
          <NavLink key={idx} to={link.to} style={({ isActive }) => navLinkStyle(isActive)}>
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
        
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", margin: "20px 0 10px 0", paddingTop: "10px" }}>
          <button
            onClick={toggleTheme}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "none",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "14px",
              transition: "all 0.2s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
              <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <div style={{ 
              width: "36px", height: "20px", background: theme === "dark" ? "#3b82f6" : "rgba(255,255,255,0.1)", 
              borderRadius: "20px", position: "relative", transition: "0.3s" 
            }}>
              <div style={{
                width: "16px", height: "16px", background: "#fff", borderRadius: "50%",
                position: "absolute", top: "2px", left: theme === "dark" ? "18px" : "2px", transition: "0.3s"
              }}/>
            </div>
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "none",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "14px",
              marginTop: "4px",
              transition: "all 0.2s",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div style={{
        marginTop: "20px",
        padding: "16px 10px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderTop: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "#fbbf24",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
           <img src="https://ui-avatars.com/api/?name=Super+Admin&background=fbbf24&color=fff" alt="Admin" style={{width: "100%", height: "100%"}} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>Super Admin</span>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>superadmin@gmail.com</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
