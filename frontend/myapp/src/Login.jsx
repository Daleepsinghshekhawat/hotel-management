import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import URL from "./api";

function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({ 
    email: "", 
    password: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${URL}/users/login`, data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.user.role === "superadmin") navigate("/superadmin");
      else if (res.data.user.role === "admin") navigate("/adminpage");
      else if (res.data.user.role === "hotelOwner") navigate("/hotel");
      else  navigate("/user");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🏨</div>
          <h1 style={{ color: "#fff", margin: "0 0 6px", fontSize: "28px", fontWeight: 800 }}>
            HotelHub
          </h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
            Hotel Management Platform
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "20px",
            padding: "36px 32px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <h2 style={{ color: "#fff", margin: "0 0 24px", fontSize: "20px", fontWeight: 700 }}>
            Sign In
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: "#cbd5e1", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <Link
              to="/forgotpassword"
              style={{
                color: "#60a5fa",
                textDecoration: "none",
                fontSize: "13px",
                textAlign: "right",
                marginTop: "-8px",
              }}
            >
              Forgot Password?
            </Link>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                background: loading ? "#1d4ed8" : "linear-gradient(135deg, #2563eb, #3b82f6)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "4px",
                transition: "opacity 0.2s",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? "⏳ Signing in..." : "Sign In →"}
            </button>
          </form>

          <p style={{ color: "#94a3b8", textAlign: "center", fontSize: "13px", margin: "20px 0 0" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>
              Sign Up
            </Link>
          </p>
            <Link to="/become-admin">Become Admin</Link>
            <p style={{ color: "#64748b", fontSize: "12px", textAlign: "center", margin: "10px 0 0" }}>
              Become an admin . Free to apply.
            </p>
          </div>
        </div>
      </div>
  );
}

export default Login;
