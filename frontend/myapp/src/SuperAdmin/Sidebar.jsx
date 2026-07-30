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
  LogOut 
} from "lucide-react";

function Sidebar() {
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
    { to: "/superadmin/bookings", icon: <BookOpen size={20} />, label: "Bookings" },
    { to: "/superadmin/approved", icon: <Building2 size={20} />, label: "Hotels" },
    { to: "/superadmin/users", icon: <Users size={20} />, label: "Users" },
    { to: "/superadmin/admins/all", icon: <UserCog size={20} />, label: "Admins" },
    { to: "/superadmin/employees", icon: <Briefcase size={20} />, label: "Employees" },
    { to: "/superadmin/state", icon: <Globe size={20} />, label: "States" },
    { to: "/superadmin/district", icon: <Map size={20} />, label: "Districts" },
    { to: "/superadmin/city", icon: <MapPin size={20} />, label: "Cities" },
    { to: "/superadmin/taxes", icon: <Receipt size={20} />, label: "Taxes & Charges" },
    { to: "/superadmin/coupons", icon: <Tags size={20} />, label: "Offers & Coupons" },
    { to: "/superadmin/reviews", icon: <MessageSquare size={20} />, label: "Reviews" },
    { to: "/superadmin/reports", icon: <BarChart2 size={20} />, label: "Reports" },
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
        <div style={{ padding: "0 10px", marginBottom: "24px" }}>
          {/* Invisible gap since the logo isn't in screenshot, but we can keep it blank or add title */}
        </div>

        {links.map((link, idx) => (
          <NavLink key={idx} to={link.to} style={({ isActive }) => navLinkStyle(isActive)}>
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
        
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
            marginTop: "10px",
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
