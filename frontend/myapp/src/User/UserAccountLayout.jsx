import React from "react";
import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";

export default function UserAccountLayout() {
  return (
    <div style={{ background: "#050505", minHeight: "100vh", paddingTop: "40px", paddingBottom: "100px" }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        display: "flex",
        gap: "32px",
        alignItems: "flex-start",
        flexWrap: "wrap"
      }}>
        {/* Sidebar */}
        <div style={{ flex: "0 0 260px" }}>
          <UserSidebar />
        </div>

        {/* Main Content Area */}
        <div style={{ flex: "1", minWidth: "300px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
