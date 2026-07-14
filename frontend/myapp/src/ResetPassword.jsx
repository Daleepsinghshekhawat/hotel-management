import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import URL from "./api";


function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const email = localStorage.getItem("resetEmail");

    try {
      const res = await axios.post(`${URL}/users/resetpassword`, {
        email,
        password,
      });

      alert(res.data.message);

      localStorage.removeItem("resetEmail");

      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
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
        <h2 style={{ textAlign: "center" }}>Reset Password</h2>

        <input
          type="password"
          placeholder="Enter New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "12px",
            border: "1px solid gray",
            borderRadius: "5px",
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
          Update Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
