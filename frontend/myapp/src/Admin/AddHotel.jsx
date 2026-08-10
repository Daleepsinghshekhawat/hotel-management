import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import apiurl from "../api";
import useTheme from "../useTheme";
import { Building2, MapPin, User, Mail, Info, Type, Image as ImageIcon, CheckCircle } from "lucide-react";

export default function AddHotel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [images, setImages] = useState([]);

  const [hotelType, setHotelType] = useState("Hotel");
  const [amenities, setAmenities] = useState([]);
  const availableAmenities = ["WiFi", "Parking", "Restaurant", "Swimming Pool", "AC", "Room Service", "Gym", "Spa"];

  const handleAmenityChange = (e) => {
    const value = e.target.value;
    setAmenities(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    hotelName: "",
    ownerName: user.name || "",
    email: user.email || "",
    description: "",
  });

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get(`${apiurl}/api/getAllState`);
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
        const res = await axios.get(`${apiurl}/api/getDistrictByState/${selectedState}`);
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
        const res = await axios.get(`${apiurl}/api/getCityByDistrict/${selectedDistrict}`);
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
      formData.append("submittedBy", user.email);
      formData.append("hotelType", hotelType);
      formData.append("amenities", JSON.stringify(amenities));
      
      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.post(`${apiurl}/api/submitHotelRequest`, formData);

      alert("Hotel submitted successfully! Waiting for superadmin approval.");
      navigate("/adminpage/hotels");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit hotel");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    paddingLeft: "38px",
    borderRadius: "10px",
    border: isDark ? "1px solid #e2e8f0" : "1px solid #334155",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    background: isDark ? "#f8fafc" : "#0f172a",
    color: isDark ? "#0f172a" : "#f8fafc",
    transition: "all 0.2s ease",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: 600,
    fontSize: "13px",
    color: isDark ? "#475569" : "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  };
  
  const iconStyle = {
    position: "absolute",
    left: "12px",
    top: "35px",
    color: isDark ? "#94a3b8" : "#64748b",
  };

  const sectionStyle = {
    background: isDark ? "#ffffff" : "#1e293b",
    padding: "30px",
    borderRadius: "16px",
    border: isDark ? "1px solid #e2e8f0" : "1px solid #334155",
    marginBottom: "24px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", maxWidth: "900px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: "32px", color: isDark ? "#f8fafc" : "#0f172a", fontWeight: 800 }}>
          List a New Property
        </h2>
        <p style={{ margin: 0, color: isDark ? "#94a3b8" : "#64748b", fontSize: "16px", maxWidth: "600px", marginInline: "auto" }}>
          Fill in the details below to add a new hotel, resort, or villa to the platform. 
          Once submitted, it will be reviewed by an administrator.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* SECTION 1: Basic Information */}
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 20px", fontSize: "18px", color: isDark ? "#0f172a" : "#f8fafc", borderBottom: isDark ? "1px solid #e2e8f0" : "1px solid #334155", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Building2 size={20} color="#3b82f6" /> Property Information
          </h3>
          
          <div style={{ display: "grid", gap: "20px" }}>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Property Name *</label>
              <Building2 size={18} style={iconStyle} />
              <input
                style={inputStyle}
                name="hotelName"
                value={form.hotelName}
                onChange={handleChange}
                placeholder="E.g., The Grand Palace Resort"
                required
              />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>Owner Name *</label>
                <User size={18} style={iconStyle} />
                <input
                  style={inputStyle}
                  name="ownerName"
                  value={form.ownerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>Contact Email *</label>
                <Mail size={18} style={iconStyle} />
                <input
                  style={inputStyle}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contact@hotel.com"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Location Details */}
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 20px", fontSize: "18px", color: isDark ? "#0f172a" : "#f8fafc", borderBottom: isDark ? "1px solid #e2e8f0" : "1px solid #334155", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <MapPin size={20} color="#10b981" /> Location
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>State *</label>
              <MapPin size={18} style={iconStyle} />
              <select
                style={{...inputStyle, paddingLeft: "38px"}}
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                required
              >
                {states.map((s) => (
                  <option key={s._id} value={s._id}>{s.Statename}</option>
                ))}
              </select>
            </div>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>District *</label>
              <MapPin size={18} style={iconStyle} />
              <select
                style={{...inputStyle, paddingLeft: "38px"}}
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                required
              >
                {districts.map((d) => (
                  <option key={d._id} value={d._id}>{d.districtname}</option>
                ))}
              </select>
            </div>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>City *</label>
              <MapPin size={18} style={iconStyle} />
              <select
                style={{...inputStyle, paddingLeft: "38px"}}
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                required
              >
                {cities.map((c) => (
                  <option key={c._id} value={c._id}>{c.cityname}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: Features & Amenities */}
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 20px", fontSize: "18px", color: isDark ? "#0f172a" : "#f8fafc", borderBottom: isDark ? "1px solid #e2e8f0" : "1px solid #334155", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Info size={20} color="#f59e0b" /> Features & Description
          </h3>
          
          <div style={{ display: "grid", gap: "20px" }}>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Property Type *</label>
              <Type size={18} style={iconStyle} />
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
            
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Description *</label>
              <textarea
                style={{ ...inputStyle, paddingLeft: "14px", resize: "vertical", minHeight: "120px" }}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the property, room types, nearby attractions, and other highlights..."
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Amenities (Optional)</label>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", 
                gap: "12px", 
                padding: "20px", 
                background: isDark ? "#f8fafc" : "#0f172a", 
                borderRadius: "12px", 
                border: isDark ? "1px solid #e2e8f0" : "1px solid #334155" 
              }}>
                {availableAmenities.map((amenity) => (
                  <label key={amenity} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px", 
                    fontSize: "14px", 
                    color: isDark ? "#334155" : "#cbd5e1", 
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "8px",
                    background: amenities.includes(amenity) ? (isDark ? "#dbeafe" : "#1e3a8a") : "transparent",
                    transition: "background 0.2s"
                  }}>
                    <input
                      type="checkbox"
                      value={amenity}
                      checked={amenities.includes(amenity)}
                      onChange={handleAmenityChange}
                      style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#3b82f6" }}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Media */}
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 20px", fontSize: "18px", color: isDark ? "#0f172a" : "#f8fafc", borderBottom: isDark ? "1px solid #e2e8f0" : "1px solid #334155", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ImageIcon size={20} color="#8b5cf6" /> Images
          </h3>
          
          <div>
            <label style={labelStyle}>Upload Property Images *</label>
            <div style={{
              border: isDark ? "2px dashed #cbd5e1" : "2px dashed #475569",
              padding: "40px 20px",
              textAlign: "center",
              borderRadius: "12px",
              background: isDark ? "#f8fafc" : "#0f172a",
              position: "relative",
              cursor: "pointer"
            }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                multiple 
                required={images.length === 0} 
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer"
                }}
              />
              <ImageIcon size={40} color="#94a3b8" style={{ marginBottom: "12px" }} />
              <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600, color: isDark ? "#334155" : "#e2e8f0" }}>
                Click or drag images to upload
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: isDark ? "#64748b" : "#94a3b8" }}>
                Supports JPG, PNG, WEBP. Max 5MB per image.
              </p>
            </div>
            
            {images.length > 0 && (
              <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {images.map((img, i) => (
                  <div key={i} style={{ padding: "8px 12px", background: isDark ? "#e2e8f0" : "#334155", borderRadius: "8px", fontSize: "13px", color: isDark ? "#334155" : "#cbd5e1", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle size={14} color="#10b981" />
                    {img.name.length > 15 ? img.name.substring(0, 15) + "..." : img.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            background: loading ? "#93c5fd" : "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => !loading && (e.target.style.background = "#2563eb")}
          onMouseLeave={(e) => !loading && (e.target.style.background = "#3b82f6")}
        >
          {loading ? "Submitting Property..." : "Submit Property for Approval"}
        </button>
      </form>
    </div>
  );
}
