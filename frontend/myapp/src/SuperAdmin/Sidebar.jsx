import { NavLink } from "react-router-dom";

const menuItems = [
  { to: "/superadmin/state", label: "🗺️ State" },
  { to: "/superadmin/district", label: "🏙️ District" },
  { to: "/superadmin/city", label: "🌆 City" },
  { to: "/superadmin/hotel-requests", label: "🏨 Hotel Requests" },
];

function Sidebar() {
  return (
    <div
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f8fafc",
        padding: "24px 18px",
        boxShadow: "2px 0 10px rgba(0,0,0,0.16)",
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: "22px" }}>Hotel Admin</h2>
      <p
        style={{
          margin: "0 0 24px",
          color: "#94a3b8",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Management
      </p>

      {menuItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: "block",
            textDecoration: "none",
            padding: "10px 12px",
            marginBottom: "8px",
            borderRadius: "8px",
            color: isActive ? "#ffffff" : "#cbd5e1",
            background: isActive ? "#2563eb" : "transparent",
            fontWeight: isActive ? 600 : 500,
          })}
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

export default Sidebar;
