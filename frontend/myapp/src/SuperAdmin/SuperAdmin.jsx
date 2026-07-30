import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function SuperAdmin() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default SuperAdmin;
