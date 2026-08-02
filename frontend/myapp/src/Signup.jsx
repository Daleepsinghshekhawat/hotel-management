
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import URL from "./api";

function Signup() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await axios.post(`${URL}/users/signup`, data);
      alert(res.data.message || "Signup successful!");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // User exists, try logging them in automatically
        try {
          const loginRes = await axios.post(`${URL}/users/login`, {
            email: data.email,
            password: data.password
          });
          
          alert("Account exists! Logging you in automatically.");
          
          localStorage.setItem("token", loginRes.data.token);
          localStorage.setItem("user", JSON.stringify(loginRes.data.user));
          
          if (loginRes.data.user.role === "superadmin") navigate("/superadmin");
          else if (loginRes.data.user.role === "admin") navigate("/adminpage");
          else if (loginRes.data.user.role === "hotelOwner") navigate("/hotel");
          else navigate("/user");
          
        } catch (loginErr) {
          alert("This email is already registered, but the password provided is incorrect. Please go to the Login page.");
        }
      } else if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("An error occurred during signup.");
      }
      console.error("Signup error:", err);
    }
  }

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background:
        "linear-gradient(135deg, #0f172a, #1e3a8a, #2563eb)",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
    },

    card: {
      width: "380px",
      background: "rgba(255,255,255,0.12)",
      backdropFilter: "blur(15px)",
      borderRadius: "20px",
      padding: "35px",
      boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
      border: "1px solid rgba(255,255,255,0.2)",
    },

    title: {
      color: "#fff",
      textAlign: "center",
      marginBottom: "8px",
      fontSize: "32px",
      fontWeight: "bold",
    },

    subtitle: {
      textAlign: "center",
      color: "#ddd",
      marginBottom: "30px",
      fontSize: "14px",
    },

    input: {
      width: "100%",
      padding: "14px",
      marginBottom: "18px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.3)",
      outline: "none",
      background: "rgba(255,255,255,0.15)",
      color: "#fff",
      fontSize: "15px",
      boxSizing: "border-box",
    },

    button: {
      width: "100%",
      padding: "14px",
      background: "#fff",
      color: "#1e3a8a",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "0.3s",
    },

    loginText: {
      textAlign: "center",
      color: "#eee",
      marginTop: "20px",
      fontSize: "14px",
    },

    link: {
      color: "#FFD700",
      marginLeft: "5px",
      textDecoration: "none",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>

        <p style={styles.subtitle}>
          Sign up to continue
        </p>

        <input
          type="text"
          name="name"
          placeholder="👤 Enter Name"
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="email"
          name="email"
          placeholder="📧 Enter Email"
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="🔒 Enter Password"
          onChange={handleChange}
          style={styles.input}
        />

        <button
          type="submit"
          style={styles.button}
          onMouseOver={(e) => {
            e.target.style.background = "#2563eb";
            e.target.style.color = "#fff";
            e.target.style.transform = "scale(1.03)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#fff";
            e.target.style.color = "#1e3a8a";
            e.target.style.transform = "scale(1)";
          }}
        >
          Create Account
        </button>

        <p style={styles.loginText}>
          Already have an account?
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;