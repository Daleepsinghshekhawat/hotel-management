import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import useTheme from "../useTheme";

const Admin = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme === "dark" ? "#111827" : "#f8fafc" }}>
      <AdminSidebar theme={theme} toggleTheme={toggleTheme} />
      <div style={{ flex: 1, padding: "0px", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>
        <div style={{ padding: "24px", width: "100%", boxSizing: "border-box" }}>
          <Outlet context={{ theme }} />
        </div>
      </div>
    </div>
  );
};

export default Admin;