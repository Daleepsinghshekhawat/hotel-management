import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import URL from "./api";


function VerifyOtp() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const email = localStorage.getItem("resetEmail");

    try {
      await axios.post(`${URL}/users/verifyotp`, {
        email,
        otp,
      });

      alert("OTP verified");
      navigate("/resetpassword");
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
          Verify OTP
        </h2>

        <input
          type="text"
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
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
          Verify OTP
        </button>
      </form>
    </div>
  );
}

export default VerifyOtp;
