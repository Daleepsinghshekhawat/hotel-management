import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import URL from "./api";

function Login() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${URL}/users/login`, data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
       alert(error.response?.data?.message)
    }
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
        <h1 style={{ textAlign: "center" }}>Login</h1>

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
          Login
        </button>

        <Link
          to="/forgotpassword"
          style={{
            textAlign: "center",
            color: "red",
            textDecoration: "none",
          }}
        >
          Forgot Password?
        </Link>
        <p>
          {" "}
          Don't have an account ?
          <Link style={{ color: "blue" }} to="/">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
