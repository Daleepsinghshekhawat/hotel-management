import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function SuperAdmin() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "24px" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default SuperAdmin;
