import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import URL from "./api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await axios.post(`${URL}/users/forgotpassword`, {
        email,
      });

      localStorage.setItem("resetEmail", email);

      alert("OTP sent to your email");
      navigate("/verifyotp");
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f4f4",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "350px",
          padding: "30px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0px 0px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "12px",
            border: "1px solid gray",
            borderRadius: "5px",
            outline: "none",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send OTP
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
