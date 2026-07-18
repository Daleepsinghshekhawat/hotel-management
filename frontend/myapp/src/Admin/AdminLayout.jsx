import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";

function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <AdminSidebar />
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

export default AdminLayout;
