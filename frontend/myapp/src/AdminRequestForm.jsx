import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "./api";

export default function AdminRequestForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    mobileNumber: "",
    occupation: "",
    criminalCase: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${URL}/api/register`,
        formData
      );

      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#dbeafe,#eff6ff,#ffffff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "#fff",
          borderRadius: "25px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,.15)",
        }}
      >
        {/* Header */}

        <div
          style={{
            background:
              "linear-gradient(90deg,#2563eb,#1d4ed8,#1e3a8a)",
            color: "#fff",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "36px",
              fontWeight: "bold",
            }}
          >
            Become an Admin
          </h1>

          <p
            style={{
              marginTop: "12px",
              opacity: ".9",
              fontSize: "16px",
            }}
          >
            Submit your verification request to become
            a verified hotel administrator.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: "40px",
          }}
        >
          <h2
            style={{
              color: "#1e3a8a",
              marginBottom: "30px",
            }}
          >
            Personal Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap: "25px",
            }}
          >
            {/* Name */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Email */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                required
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
                        {/* Mobile Number */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Mobile Number
              </label>

              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="9876543210"
                required
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Occupation */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Occupation
              </label>

              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="Hotel Owner"
                required
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

          </div>

          {/* Address */}

          <div
            style={{
              marginTop: "30px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Complete Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="5"
              placeholder="Enter your complete address..."
              required
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Verification Notice */}

          <div
            style={{
              marginTop: "30px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "15px",
              padding: "20px",
            }}
          >
            <h3
              style={{
                margin: "0 0 10px 0",
                color: "#1d4ed8",
                fontSize: "18px",
              }}
            >
              Verification Process
            </h3>

            <p
              style={{
                margin: 0,
                color: "#475569",
                lineHeight: "26px",
                fontSize: "15px",
              }}
            >
              Your request will be reviewed by the Super Admin.
              Once approved, you'll receive administrator access
              to manage hotels, bookings, rooms, and customers.
            </p>
          </div>
                    {/* Criminal Case */}

          <div
            style={{
              marginTop: "30px",
              border: "1px solid #e5e7eb",
              borderRadius: "15px",
              padding: "20px",
              background: "#fafafa",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              <input
                type="checkbox"
                name="criminalCase"
                checked={formData.criminalCase}
                onChange={handleChange}
                style={{
                  width: "20px",
                  height: "20px",
                  marginRight: "12px",
                  cursor: "pointer",
                }}
              />

              Have you ever been involved in any criminal case?
            </label>
          </div>

          {/* Declaration */}

          <div
            style={{
              marginTop: "25px",
              border: "1px solid #dbeafe",
              background: "#f8fbff",
              borderRadius: "15px",
              padding: "20px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#1e40af",
                fontSize: "18px",
              }}
            >
              Declaration
            </h3>

            <p
              style={{
                color: "#475569",
                lineHeight: "28px",
                marginBottom: "20px",
              }}
            >
              I hereby declare that all the information provided by me is true
              and correct. I understand that providing false information may
              result in rejection of my admin request.
            </p>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                required
                style={{
                  width: "20px",
                  height: "20px",
                  marginRight: "12px",
                }}
              />

              <span
                style={{
                  color: "#374151",
                  fontWeight: "500",
                }}
              >
                I agree with the declaration above.
              </span>
            </label>
          </div>

          {/* Submit Button */}

          <div
            style={{
              marginTop: "35px",
            }}
          >
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "18px",
                background:
                  "linear-gradient(90deg,#2563eb,#1d4ed8)",
                color: "#fff",
                border: "none",
                borderRadius: "14px",
                fontSize: "18px",
                fontWeight: "600",
                cursor: "pointer",
                transition: ".3s",
                boxShadow: "0 10px 25px rgba(37,99,235,.3)",
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow =
                  "0 18px 35px rgba(37,99,235,.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow =
                  "0 10px 25px rgba(37,99,235,.3)";
              }}
            >
              Submit Admin Request
            </button>
          </div>

          {/* Login */}

          <div
            style={{
              textAlign: "center",
              marginTop: "25px",
            }}
          >
            <span
              style={{
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              Already have an account?
            </span>

            <span
              onClick={() => navigate("/login")}
              style={{
                marginLeft: "8px",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Login
            </span>
          </div>

        </form>

      </div>

    </div>
  );
}