import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import useTheme from "../useTheme";

function SuperAdmin() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme === "dark" ? "#0f172a" : "#f8fafc" }}>
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <Outlet context={{ theme }} />
      </div>
    </div>
  );
}

export default SuperAdmin;
