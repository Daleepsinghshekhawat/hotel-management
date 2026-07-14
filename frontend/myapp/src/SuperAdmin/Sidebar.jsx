import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        background: "#1e293b",
        color: "white",
        padding: "20px",
      }}
    >
      <h2>Location</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <NavLink
          to="/superadmin/state"
          style={{ color: "white", textDecoration: "none" }}
        >
          State
        </NavLink>

        <NavLink
          to="/superadmin/district"
          style={{ color: "white", textDecoration: "none" }}
        >
          District
        </NavLink>

        <NavLink
          to="/superadmin/city"
          style={{ color: "white", textDecoration: "none" }}
        >
          City
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
