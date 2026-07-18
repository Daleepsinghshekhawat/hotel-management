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

    const res = await axios.post(`${URL}/users/signup`, data);

    alert(res.data.message);

    navigate("/login");
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "300px",
          padding: "30px",
          border: "1px solid gray",
          borderRadius: "10px",
          boxShadow: "0px 0px 10px lightgray",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Signup</h1>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          onChange={handleChange}
          style={{ padding: "10px" }}
        />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          onChange={handleChange}
          style={{ padding: "10px" }}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          onChange={handleChange}
          style={{ padding: "10px" }}
        />

      
        <button
          type="submit"
          style={{
            padding: "10px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Signup
        </button>
        <p>
          Already have an account ?
          <Link style={{ color: "blue" }} to="/login">
            login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
