import React from "react";
import useTheme from "./UseTheme";

const Admin = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          theme === "dark"
            ? "linear-gradient(135deg,#0f172a,#1e293b,#334155)"
            : "linear-gradient(135deg,#dbeafe,#f8fafc,#bfdbfe)",
        transition: "0.4s",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 50px",
          background:
            theme === "dark" ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.8)",
        
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            color: theme === "dark" ? "white" : "#1e293b",
            margin: 0,
            fontSize: "28px",
          }}
        >
          Admin Dashboard
        </h2>

        <button onClick={toggleTheme} style={buttonStyle}>
          {theme === "light" ? "🌙 Dark" : "☀ Light"}
        </button>
      </nav>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "650px",
            padding: "50px",
            borderRadius: "20px",
            background:
              theme === "dark"
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.75)",
            backdropFilter: "blur(15px)",
            textAlign: "center",
            boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
          }}
        >
          <h1
            style={{
              fontSize: "38px",
              marginBottom: "15px",
              color: theme === "dark" ? "#fff" : "#1e293b",
            }}
          >
            Welcome Admin 👋
          </h1>

          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.7",
              color: theme === "dark" ? "#d1d5db" : "#475569",
            }}
          >
            This page is accessible only to administrators.
            <br />
            Manage users, roles, permissions, and application settings from
            here.
          </p>

          <button
            style={{
              marginTop: "35px",
              padding: "14px 35px",
              fontSize: "16px",
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "0.3s",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "white",
  fontSize: "15px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default Admin;
