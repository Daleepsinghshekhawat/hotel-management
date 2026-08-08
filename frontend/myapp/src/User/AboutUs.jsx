import React from "react";
import { Users, Globe, ShieldCheck, HeartHandshake } from "lucide-react";

export default function AboutUs() {
  const values = [
    {
      icon: <Globe size={32} color="var(--accent-color)" />,
      title: "Global Reach, Local Feel",
      description: "We connect you to thousands of premium hotels across the globe while maintaining a personalized touch."
    },
    {
      icon: <ShieldCheck size={32} color="#16a34a" />,
      title: "Trusted & Secure",
      description: "Your safety and security are our top priorities. We vet every hotel to ensure quality and peace of mind."
    },
    {
      icon: <HeartHandshake size={32} color="#e51d53" />,
      title: "Exceptional Service",
      description: "Our dedicated support team is available 24/7 to ensure your journey is seamless from booking to checkout."
    },
    {
      icon: <Users size={32} color="#9333ea" />,
      title: "Community Driven",
      description: "Built by travelers for travelers. We listen to your feedback to constantly improve our platform."
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
        padding: "100px 5%",
        color: "#fff",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, margin: "0 0 24px", letterSpacing: "-1px" }}>
            Reimagining the way you travel
          </h1>
          <p style={{ fontSize: "18px", lineHeight: "1.6", color: "#cbd5e1", margin: 0 }}>
            StayEase was founded on a simple principle: finding the perfect accommodation should be as exciting as the trip itself. 
            We provide a curated selection of world-class hotels combined with an effortless booking experience.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ maxWidth: "1200px", margin: "-40px auto 80px", padding: "0 5%", position: "relative", zIndex: 10 }}>
        
        {/* Stats Row */}
        <div style={{
          background: "var(--bg-secondary)",
          borderRadius: "20px",
          padding: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          marginBottom: "80px",
          border: "1px solid var(--border-color)",
          textAlign: "center"
        }}>
          <div>
            <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>10K+</div>
            <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Hotels Worldwide</div>
          </div>
          <div>
            <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>2M+</div>
            <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Happy Travelers</div>
          </div>
          <div>
            <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>98%</div>
            <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Satisfaction Rate</div>
          </div>
          <div>
            <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>24/7</div>
            <div style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Customer Support</div>
          </div>
        </div>

        {/* Our Mission */}
        <div style={{ marginBottom: "80px", textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "24px" }}>Our Mission</h2>
          <p style={{ maxWidth: "800px", margin: "0 auto", color: "var(--text-secondary)", fontSize: "18px", lineHeight: "1.7" }}>
            To empower global explorers by providing a trustworthy, seamless, and deeply personalized booking experience. 
            We believe that where you stay sets the tone for your entire journey, and we are committed to making sure every stay is extraordinary.
          </p>
        </div>

        {/* Values Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {values.map((val, idx) => (
            <div key={idx} style={{
              background: "var(--bg-secondary)",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
            }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                {val.icon}
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 12px" }}>{val.title}</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.6" }}>{val.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
