import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import apiurl from "../api";

export default function EditHotel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    hotelName: "",
    ownerName: "",
    email: "",
    description: "",
  });

  const [hotelType, setHotelType] = useState("Hotel");
  const [amenities, setAmenities] = useState([]);
  const availableAmenities = ["WiFi", "Parking", "Restaurant", "Swimming Pool", "AC", "Room Service"];

  const handleAmenityChange = (e) => {
    const value = e.target.value;
    setAmenities(prev => 
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  // Fetch all states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiurl}/api/getAllState`, { headers: { Authorization: `Bearer ${token}` } });
        const list = (res.data?.result || []).filter((s) => s.status === "active");
        setStates(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStates();
  }, []);

  // Fetch hotel details to pre-fill
  useEffect(() => {
    const fetchHotel = async () => {
      setFetching(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiurl}/api/getHotelById/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.result) {
          const hotel = res.data.result;
          setForm({
            hotelName: hotel.hotelName || "",
            ownerName: hotel.ownerName || "",
            email: hotel.email || "",
            description: hotel.description || "",
          });
          setCurrentImage(hotel.images?.[0] || "");
          if (hotel.hotelType) setHotelType(hotel.hotelType);
          if (hotel.amenities) setAmenities(hotel.amenities);

          // Resolve location
          if (hotel.location) {
            const loc = hotel.location;
            setSelectedState(loc.state?._id || loc.state || "");
            setSelectedDistrict(loc.district?._id || loc.district || "");
            setSelectedCity(loc._id || loc || "");
          }
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load hotel details.");
      } finally {
        setFetching(false);
      }
    };
    fetchHotel();
  }, [id]);

  // Fetch districts when state changes
  useEffect(() => {
    if (!selectedState) return;
    const fetchDistricts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiurl}/api/getDistrictByState/${selectedState}`, { headers: { Authorization: `Bearer ${token}` } });
        const list = (res.data?.result || []).filter((d) => d.status === "active");
        setDistricts(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  // Fetch cities when district changes
  useEffect(() => {
    if (!selectedDistrict) return;
    const fetchCities = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiurl}/api/getCityByDistrict/${selectedDistrict}`, { headers: { Authorization: `Bearer ${token}` } });
        const list = Array.isArray(res.data?.result) ? res.data.result : [];
        const active = list.filter((c) => c.status === "active");
        setCities(active);
      } catch (err) {
        console.error(err);
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
      if (images && images.length > 0) {
        images.forEach((img) => {
          formData.append("images", img);
        });
      }

      const token = localStorage.getItem('token');
      await axios.patch(`${apiurl}/api/updateHotel/${id}`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });

      alert("Hotel updated successfully!");
      navigate(-1); // Go back to the previous list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update hotel");
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

  if (fetching) {
    return (
      <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontFamily: "sans-serif" }}>
        ⏳ Fetching hotel details...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: "800px", margin: "20px auto" }}>
      {/* Header Section */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <span style={{
          background: "#fef3c7",
          color: "#d97706",
          padding: "6px 14px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          display: "inline-block",
          marginBottom: "12px"
        }}>
          ✏️ Edit Details
        </span>
        <h2 style={{ margin: "0 0 8px", fontSize: "26px", color: "#0f172a", fontWeight: 800 }}>
          Edit Hotel Information
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px", maxWidth: "600px", margin: "0 auto", lineHeight: "1.5" }}>
          Update the profile details, location parameters, and listing images of the hotel.
        </p>
      </div>

      <div style={{
        background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
        borderRadius: "20px",
        padding: "40px",
        border: "1px solid #e2e8f0",
        borderTop: "6px solid #d97706",
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
            <label style={labelStyle}>Property Type</label>
            <select
              style={inputStyle}
              value={hotelType}
              onChange={(e) => setHotelType(e.target.value)}
            >
              <option value="Hotel">Hotel</option>
              <option value="Resort">Resort</option>
              <option value="Villa">Villa</option>
              <option value="Homestay">Homestay</option>
              <option value="Hostel">Hostel</option>
            </select>
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
            <label style={labelStyle}>Current Hotel Banner</label>
            {currentImage && (
              <img 
                src={currentImage} 
                alt="Current banner" 
                style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "12px", display: "block" }} 
              />
            )}
            
            <label style={labelStyle}>Replace Banner Image (Optional)</label>
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
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#d97706"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                multiple
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
                {images.length > 0 ? `Selected: ${images.length} images` : "Click or drag to select new banner images"}
              </span>
              <span style={{ fontSize: "11px", display: "block", color: "#94a3b8", marginTop: "4px" }}>
                Leave empty to retain current banner images
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: loading ? "#fde68a" : "#d97706",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease-in-out",
              boxShadow: "0 4px 10px rgba(217, 119, 6, 0.25)",
              marginTop: "12px"
            }}
            onMouseEnter={(e) => { if(!loading) e.currentTarget.style.background = "#b45309"; }}
            onMouseLeave={(e) => { if(!loading) e.currentTarget.style.background = "#d97706"; }}
          >
            {loading ? "Updating Hotel..." : "💾 Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
