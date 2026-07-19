import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "../api";

export default function AddHotelDirect() {
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    hotelName: "",
    ownerName: "",
    email: "",
    description: "",
  });

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get(`${URL}/api/getAllState`);
        const list = (res.data?.result || []).filter((s) => s.status === "active");
        setStates(list);
        if (list.length > 0) setSelectedState(list[0]._id);
      } catch (err) {
        console.log(err);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!selectedState) return;
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${URL}/api/getDistrictByState/${selectedState}`);
        const list = (res.data?.result || []).filter((d) => d.status === "active");
        setDistricts(list);
        if (list.length > 0) {
          setSelectedDistrict(list[0]._id);
        } else {
          setSelectedDistrict("");
          setSelectedCity("");
          setCities([]);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  useEffect(() => {
    if (!selectedDistrict) return;
    const fetchCities = async () => {
      try {
        const res = await axios.get(`${URL}/api/getCityByDistrict/${selectedDistrict}`);
        const list = Array.isArray(res.data?.result) ? res.data.result : [];
        const active = list.filter((c) => c.status === "active");
        setCities(active);
        if (active.length > 0) setSelectedCity(active[0]._id);
        else setSelectedCity("");
      } catch (err) {
        console.log(err);
      }
    };
    fetchCities();
  }, [selectedDistrict]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(window.URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCity) {
      alert("Please select a city");
      return;
    }
    if (!image) {
      alert("Please upload a hotel image");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("hotelName", form.hotelName.trim());
      formData.append("ownerName", form.ownerName.trim());
      formData.append("email", form.email.trim());
      formData.append("location", selectedCity);
      formData.append("description", form.description.trim());
      formData.append("image", image);

      await axios.post(`${URL}/api/addHotelDirect`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Hotel registered successfully and approved!");
      navigate("/superadmin/hotel-requests");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to register hotel");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
    fontSize: "13px",
    color: "#374151",
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          Direct Hotel Registration
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Directly add a new hotel listing to the platform. It will be pre-approved, saved as an active hotel, and the owner role will be updated to "hotelOwner".
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
        <div>
          <label style={labelStyle}>Hotel Name *</label>
          <input
            style={inputStyle}
            name="hotelName"
            value={form.hotelName}
            onChange={handleChange}
            placeholder="Grand Palace Hotel"
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Owner Name *</label>
            <input
              style={inputStyle}
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              placeholder="Owner's Name"
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Owner Contact Email *</label>
            <input
              style={inputStyle}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="owner@example.com"
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>State *</label>
            <select
              style={inputStyle}
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              required
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.Statename}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>District *</label>
            <select
              style={inputStyle}
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              required
              disabled={!selectedState}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.districtname}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>City *</label>
            <select
              style={inputStyle}
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              required
              disabled={!selectedDistrict}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.cityname}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description *</label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe amenities, location, and key features..."
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Hotel Image *</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{
                marginTop: "12px",
                width: "100%",
                maxHeight: "220px",
                objectFit: "cover",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "13px",
            background: loading ? "#93c5fd" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "15px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Registering Hotel..." : "Register & Approve"}
        </button>
      </form>
    </div>
  );
}
