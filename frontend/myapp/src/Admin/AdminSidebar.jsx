import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  BedDouble, 
  CalendarCheck, 
  ClipboardList, 
  Users, 
  Tags,
  LogOut,
  UserCog,
  Moon,
  Sun
} from "lucide-react";

function AdminSidebar({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const menuItems = [
    { to: "/adminpage", label: "Dashboard", icon: <LayoutDashboard size={20} />, end: true },
    { to: "/adminpage/add-hotel", label: "Add Hotel", icon: <Building2 size={20} /> },
    { to: "/adminpage/hotels", label: "My Hotels", icon: <BedDouble size={20} /> },
    { to: "/adminpage/bookings", label: "Active Bookings", icon: <CalendarCheck size={20} /> },
    { to: "/adminpage/booking-history", label: "Booking History", icon: <ClipboardList size={20} /> },
    { to: "/adminpage/users-owners", label: "Accounts", icon: <Users size={20} /> },
    { to: "/adminpage/coupons", label: "Offers & Coupons", icon: <Tags size={20} /> },
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
        {/* Brand Header */}
        <div style={{ padding: "10px", marginBottom: "30px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(255, 255, 255, 0.2)"
          }}>
            <UserCog size={20} color="#0f172a" />
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
            Admin
          </span>
        </div>

        {/* Links */}
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              textDecoration: "none",
              padding: "12px 20px",
              marginBottom: "4px",
              borderRadius: "10px",
              color: isActive ? "#0f172a" : "#94a3b8",
              background: isActive ? "#ffffff" : "transparent",
              fontWeight: isActive ? 600 : 500,
              fontSize: "14px",
              transition: "all 0.2s ease",
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        {/* Logout */}
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
              e.currentTarget.style.color = "#ef4444";
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

      {/* User Profile Footer */}
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
          background: "#ffffff",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
           <img src={`https://ui-avatars.com/api/?name=${user.name || "Admin"}&background=ffffff&color=0f172a`} alt="Admin" style={{width: "100%", height: "100%"}} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name || "Admin"}</span>
          <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email || "admin@system.com"}</span>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;
