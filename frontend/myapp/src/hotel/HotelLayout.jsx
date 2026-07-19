import React from "react";
import { Outlet } from "react-router-dom";
import useTheme from "../useTheme";
import HotelSidebar from "./HotelSidebar";

const HotelLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme === "dark" ? "#0f172a" : "#f8fafc" }}>
      <HotelSidebar />
      <div style={{ flex: 1, padding: "24px" }}>
        <div
          style={{
            background: theme === "dark" ? "#1e293b" : "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            color: theme === "dark" ? "#f8fafc" : "#0f172a",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button
              onClick={toggleTheme}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                backgroundColor: theme === "dark" ? "#ffffff" : "#1e293b",
                color: theme === "dark" ? "#000000" : "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              Switch to {theme === "dark" ? "Light" : "Dark"} Mode
            </button>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default HotelLayout;
