import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_URL from "./api";

const FACILITIES = [
  "WiFi",
  "Swimming Pool",
  "Parking",
  "Air Conditioning",
  "Restaurant",
  "Gym",
  "Spa",
  "Bar",
  "Room Service",
  "Conference Room",
  "Laundry",
  "Pet Friendly",
];

export default function HotelListingForm() {
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [form, setForm] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    hotelName: "",
    description: "",
    place: "",
    facilities: [],
    images: [], // base64 strings — backend will upload to Cloudinary
  });

  const [previewImages, setPreviewImages] = useState([]); // local blob previews
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleFacility = (facility) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  // Convert a File to base64 string
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result); // "data:image/jpeg;base64,..."
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImages(true);

    // Show local blob previews immediately
    const localPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviewImages((prev) => [...prev, ...localPreviews]);

    // Convert each file to base64 — backend will upload these to Cloudinary
    const base64Images = [];
    for (const file of files) {
      try {
        const b64 = await toBase64(file);
        base64Images.push(b64);
      } catch (err) {
        console.log("Failed to read file:", err.message);
      }
    }

    setForm((prev) => ({ ...prev, images: [...prev.images, ...base64Images] }));
    setUploadingImages(false);
  };


  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.ownerName.trim()) e.ownerName = "Owner name is required";
    if (!form.ownerEmail.trim()) e.ownerEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail))
      e.ownerEmail = "Invalid email address";
    if (!form.hotelName.trim()) e.hotelName = "Hotel name is required";
    if (!form.place.trim()) e.place = "Location is required";
    if (form.images.length === 0) e.images = "Please upload at least one image";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/submitHotelRequest`, form);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const s = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px",
      fontFamily: "'Segoe UI', sans-serif",
    },
    navbar: {
      width: "100%",
      maxWidth: "900px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "40px",
    },
    logo: {
      color: "#fff",
      fontSize: "22px",
      fontWeight: "700",
      textDecoration: "none",
    },
    loginLink: {
      color: "#93c5fd",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "600",
      padding: "8px 18px",
      border: "1px solid #3b82f6",
      borderRadius: "8px",
      transition: "all 0.2s",
    },
    card: {
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "20px",
      padding: "40px",
      width: "100%",
      maxWidth: "780px",
    },
    header: {
      textAlign: "center",
      marginBottom: "36px",
    },
    badge: {
      display: "inline-block",
      background: "rgba(59,130,246,0.2)",
      color: "#93c5fd",
      padding: "4px 14px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      marginBottom: "12px",
    },
    title: {
      color: "#fff",
      fontSize: "32px",
      fontWeight: "700",
      margin: "0 0 8px",
    },
    subtitle: {
      color: "#94a3b8",
      fontSize: "15px",
      margin: 0,
    },
    sectionTitle: {
      color: "#e2e8f0",
      fontSize: "14px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: "14px",
      paddingBottom: "8px",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
      marginBottom: "16px",
    },
    group: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      color: "#cbd5e1",
      fontSize: "13px",
      fontWeight: "600",
      marginBottom: "6px",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "10px",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      transition: "border 0.2s",
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "10px",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      resize: "vertical",
      minHeight: "90px",
      fontFamily: "inherit",
    },
    error: {
      color: "#f87171",
      fontSize: "12px",
      marginTop: "4px",
    },
    facilitiesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
      gap: "10px",
      marginBottom: "24px",
    },
    facilityBtn: (selected) => ({
      padding: "10px 12px",
      borderRadius: "10px",
      border: selected ? "1.5px solid #3b82f6" : "1px solid rgba(255,255,255,0.15)",
      background: selected ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.05)",
      color: selected ? "#93c5fd" : "#94a3b8",
      fontSize: "13px",
      fontWeight: selected ? "600" : "500",
      cursor: "pointer",
      textAlign: "center",
      transition: "all 0.2s",
    }),
    uploadBox: {
      border: "2px dashed rgba(255,255,255,0.25)",
      borderRadius: "14px",
      padding: "36px 20px",
      textAlign: "center",
      cursor: "pointer",
      background: "rgba(255,255,255,0.04)",
      marginBottom: "16px",
      transition: "border 0.2s, background 0.2s",
      display: "block",
      overflow: "visible",
    },
    imageGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
      gap: "10px",
      marginBottom: "24px",
    },
    imageWrap: {
      position: "relative",
      borderRadius: "10px",
      overflow: "hidden",
      aspectRatio: "1",
    },
    removeBtn: {
      position: "absolute",
      top: "4px",
      right: "4px",
      background: "rgba(0,0,0,0.7)",
      border: "none",
      borderRadius: "50%",
      width: "22px",
      height: "22px",
      color: "#fff",
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 1,
    },
    submitBtn: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #2563eb, #3b82f6)",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
      marginTop: "8px",
      transition: "opacity 0.2s",
    },
  };

  // ─── Success screen ──────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, textAlign: "center", maxWidth: "480px", padding: "60px 40px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ color: "#fff", fontSize: "28px", margin: "0 0 12px" }}>
            Request Submitted!
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "16px", lineHeight: "1.7", marginBottom: "28px" }}>
            Thank you for submitting your hotel listing request. Our team will review
            your application and you'll receive an email once a decision has been made.
          </p>
          <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "10px", padding: "14px", marginBottom: "28px" }}>
            <p style={{ color: "#6ee7b7", fontSize: "14px", margin: 0 }}>
              📧 A confirmation email has been sent to <strong>{form.ownerEmail}</strong>
            </p>
          </div>
          <Link to="/login" style={{ ...s.loginLink, display: "inline-block", padding: "12px 28px", fontSize: "15px", background: "rgba(59,130,246,0.15)" }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.navbar}>
        <Link to="/" style={s.logo}>🏨 HotelHub</Link>
        <Link to="/login" style={s.loginLink}>Login / Signup</Link>
      </nav>

      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.badge}>Hotel Owner Portal</div>
          <h1 style={s.title}>List Your Hotel</h1>
          <p style={s.subtitle}>
            Fill in your hotel details below. Our team will review and get back to you via email.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Owner Details ── */}
          <p style={s.sectionTitle}>👤 Owner Information</p>
          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Full Name *</label>
              <input
                name="ownerName"
                placeholder="Your full name"
                value={form.ownerName}
                onChange={handleChange}
                style={{ ...s.input, borderColor: errors.ownerName ? "#f87171" : undefined }}
              />
              {errors.ownerName && <p style={s.error}>{errors.ownerName}</p>}
            </div>
            <div style={s.group}>
              <label style={s.label}>Email Address *</label>
              <input
                name="ownerEmail"
                type="email"
                placeholder="you@example.com"
                value={form.ownerEmail}
                onChange={handleChange}
                style={{ ...s.input, borderColor: errors.ownerEmail ? "#f87171" : undefined }}
              />
              {errors.ownerEmail && <p style={s.error}>{errors.ownerEmail}</p>}
            </div>
          </div>
          <div style={s.group}>
            <label style={s.label}>Phone Number</label>
            <input
              name="ownerPhone"
              placeholder="+91 98765 43210"
              value={form.ownerPhone}
              onChange={handleChange}
              style={s.input}
            />
          </div>

          {/* ── Hotel Details ── */}
          <p style={{ ...s.sectionTitle, marginTop: "24px" }}>🏨 Hotel Information</p>
          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Hotel Name *</label>
              <input
                name="hotelName"
                placeholder="e.g. The Grand Palace"
                value={form.hotelName}
                onChange={handleChange}
                style={{ ...s.input, borderColor: errors.hotelName ? "#f87171" : undefined }}
              />
              {errors.hotelName && <p style={s.error}>{errors.hotelName}</p>}
            </div>
            <div style={s.group}>
              <label style={s.label}>Location / Place *</label>
              <input
                name="place"
                placeholder="e.g. Jaipur, Rajasthan"
                value={form.place}
                onChange={handleChange}
                style={{ ...s.input, borderColor: errors.place ? "#f87171" : undefined }}
              />
              {errors.place && <p style={s.error}>{errors.place}</p>}
            </div>
          </div>
          <div style={s.group}>
            <label style={s.label}>Hotel Description</label>
            <textarea
              name="description"
              placeholder="Tell guests what makes your hotel special..."
              value={form.description}
              onChange={handleChange}
              style={s.textarea}
            />
          </div>

          {/* ── Facilities ── */}
          <p style={{ ...s.sectionTitle, marginTop: "24px" }}>✨ Facilities & Amenities</p>
          <div style={s.facilitiesGrid}>
            {FACILITIES.map((facility) => (
              <button
                key={facility}
                type="button"
                onClick={() => toggleFacility(facility)}
                style={s.facilityBtn(form.facilities.includes(facility))}
              >
                {form.facilities.includes(facility) ? "✓ " : ""}{facility}
              </button>
            ))}
          </div>

          {/* ── Images ── */}
          <p style={{ ...s.sectionTitle, marginTop: "8px" }}>📸 Hotel Images *</p>

          {previewImages.length > 0 && (
            <div style={s.imageGrid}>
              {previewImages.map((src, idx) => (
                <div key={idx} style={s.imageWrap}>
                  <img
                    src={src}
                    alt={`hotel-${idx}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    style={s.removeBtn}
                    onClick={() => removeImage(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Show full dashed upload box only when NO images selected yet */}
          {previewImages.length === 0 && (
            <label style={s.uploadBox}>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleImageUpload}
                disabled={uploadingImages}
              />
              {uploadingImages ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                  </svg>
                  <p style={{ color: "#60a5fa", margin: 0, fontWeight: 600 }}>⏳ Uploading images...</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      background: "rgba(59,130,246,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                  </div>
                  <p style={{ color: "#e2e8f0", margin: 0, fontWeight: 700, fontSize: "15px" }}>
                    Click to upload hotel images
                  </p>
                  <p style={{ color: "#64748b", fontSize: "12px", margin: 0, lineHeight: 1.5 }}>
                    PNG, JPG, WEBP — up to 10 MB each<br />Multiple images allowed
                  </p>
                </div>
              )}
            </label>
          )}

          {/* When images exist — show compact Add More button + uploading indicator */}
          {previewImages.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  border: "1.5px dashed rgba(255,255,255,0.25)",
                  borderRadius: "10px",
                  cursor: uploadingImages ? "not-allowed" : "pointer",
                  background: "rgba(255,255,255,0.05)",
                  color: "#93c5fd",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "background 0.2s",
                  opacity: uploadingImages ? 0.6 : 1,
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {uploadingImages ? "Uploading..." : "Add More Photos"}
              </label>
              {uploadingImages && (
                <span style={{ color: "#60a5fa", fontSize: "13px", fontWeight: 600 }}>
                  ⏳ Uploading...
                </span>
              )}
              <span style={{ color: "#64748b", fontSize: "13px", marginLeft: "auto" }}>
                {previewImages.length} photo{previewImages.length !== 1 ? "s" : ""} selected
              </span>
            </div>
          )}

          {errors.images && <p style={s.error}>{errors.images}</p>}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading || uploadingImages}
            style={{ ...s.submitBtn, opacity: loading || uploadingImages ? 0.7 : 1 }}
          >
            {loading ? "⏳ Submitting Request..." : "🚀 Submit Hotel Listing Request"}
          </button>
        </form>
      </div>

      {/* Footer note */}
      <p style={{ color: "#475569", fontSize: "13px", marginTop: "24px" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#93c5fd" }}>
          Login here
        </Link>
      </p>
    </div>
  );
}
