import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import apiurl from "../api";

export default function AddHotelDirect() {
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [images, setImages] = useState([]);

  const [hotelType, setHotelType] = useState("Hotel");
  const [amenities, setAmenities] = useState([]);
  const availableAmenities = ["WiFi", "Parking", "Restaurant", "Swimming Pool", "AC", "Room Service"];

  const handleAmenityChange = (e) => {
    const value = e.target.value;
    setAmenities(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

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
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiurl}/api/getAllState`, { headers: { Authorization: `Bearer ${token}` } });
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
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiurl}/api/getDistrictByState/${selectedState}`, { headers: { Authorization: `Bearer ${token}` } });
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
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiurl}/api/getCityByDistrict/${selectedDistrict}`, { headers: { Authorization: `Bearer ${token}` } });
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
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => {
        const uniqueNew = newFiles.filter(nf => !prev.some(pf => pf.name === nf.name));
        return [...prev, ...uniqueNew];
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCity) {
      alert("Please select a city");
      return;
    }
    if (images.length === 0) {
      alert("Please upload at least one hotel image");
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
      formData.append("hotelType", hotelType);
      formData.append("amenities", JSON.stringify(amenities));
      
      images.forEach((img) => {
        formData.append("images", img);
      });

      const token = localStorage.getItem('token');
      await axios.post(`${apiurl}/api/addHotelDirect`, formData, { headers: { Authorization: `Bearer ${token}` } });

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
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s ease-in-out",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: 600,
    fontSize: "13px",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: "800px", margin: "20px auto" }}>
      {/* Header Section */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <span style={{
          background: "#dbeafe",
          color: "#1d4ed8",
          padding: "6px 14px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          display: "inline-block",
          marginBottom: "12px"
        }}>
          ⚡ Direct Registration
        </span>
        <h2 style={{ margin: "0 0 8px", fontSize: "26px", color: "#0f172a", fontWeight: 800 }}>
          Add Hotel Directly
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px", maxWidth: "600px", margin: "0 auto", lineHeight: "1.5" }}>
          Instantly register an active, pre-approved hotel on the platform. The system will automatically create the listing and configure the owner account.
        </p>
      </div>

      <div style={{
        background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
        borderRadius: "20px",
        padding: "40px",
        border: "1px solid #e2e8f0",
        borderTop: "6px solid #2563eb",
        boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 8px 20px -6px rgba(0, 0, 0, 0.04)",
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div>
            <label style={labelStyle}>Hotel Name *</label>
            <input
              style={inputStyle}
              name="hotelName"
              value={form.hotelName}
              onChange={handleChange}
              placeholder="e.g. Grand Palace Hotel"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Owner Name *</label>
              <input
                style={inputStyle}
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                placeholder="Owner's full name"
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
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
            <label style={labelStyle}>Hotel Type *</label>
            <select
              style={inputStyle}
              value={hotelType}
              onChange={(e) => setHotelType(e.target.value)}
              required
            >
              <option value="Hotel">Hotel</option>
              <option value="Resort">Resort</option>
              <option value="Villa">Villa</option>
              <option value="Homestay">Homestay</option>
              <option value="Hostel">Hostel</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Description & Details *</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe location, highlights, key features, and surrounding options..."
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Amenities (Optional)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", padding: "10px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
              {availableAmenities.map((amenity) => (
                <label key={amenity} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#475569", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    value={amenity}
                    checked={amenities.includes(amenity)}
                    onChange={handleAmenityChange}
                    style={{ cursor: "pointer", width: "16px", height: "16px" }}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Upload Hotel Banner Image *</label>
            <div style={{
              border: "2px dashed #cbd5e1",
              borderRadius: "12px",
              padding: "24px 20px",
              textAlign: "center",
              background: "#f8fafc",
              position: "relative",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#2563eb"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                multiple
                required 
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer",
                  width: "100%",
                  height: "100%",
                }}
              />
              <span style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}>📸</span>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>
                {images.length > 0 ? `Selected ${images.length} images` : "Click or drag to upload hotel images"}
              </span>
              <span style={{ fontSize: "11px", display: "block", color: "#94a3b8", marginTop: "4px" }}>
                Supports JPEG, PNG, or GIF formats
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: loading ? "#93c5fd" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease-in-out",
              boxShadow: "0 4px 10px rgba(37, 99, 235, 0.25)",
              marginTop: "12px"
            }}
            onMouseEnter={(e) => { if(!loading) e.currentTarget.style.background = "#1d4ed8"; }}
            onMouseLeave={(e) => { if(!loading) e.currentTarget.style.background = "#2563eb"; }}
          >
            {loading ? "Registering & Approving..." : "🚀 Register & Approve Hotel"}
          </button>
        </form>
      </div>
    </div>
  );
}
