import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { to: "/adminpage", label: "📊 Dashboard", end: true },
  { to: "/adminpage/add-hotel", label: "➕ Add Hotel" },
  { to: "/adminpage/hotels", label: "🏨 My Hotels" },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#1e293b",
        color: "#f8fafc",
        padding: "24px 18px",
        boxShadow: "2px 0 10px rgba(0,0,0,0.16)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: "22px" }}>Admin Panel</h2>
      <p
        style={{
          margin: "0 0 8px",
          color: "#94a3b8",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Hotel Management
      </p>
      <p
        style={{
          margin: "0 0 24px",
          color: "#cbd5e1",
          fontSize: "13px",
          wordBreak: "break-word",
        }}
      >
        {user.name || "Admin"}
      </p>

      <div style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
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

      <button
        onClick={handleLogout}
        style={{
          marginTop: "24px",
          padding: "10px 12px",
          borderRadius: "8px",
          border: "1px solid #475569",
          background: "transparent",
          color: "#fca5a5",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default AdminSidebar;
