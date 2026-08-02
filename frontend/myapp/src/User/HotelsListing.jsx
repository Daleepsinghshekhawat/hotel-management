import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Search, MapPin, SlidersHorizontal, Star, Waves, Dumbbell, Sparkles, Utensils, ParkingCircle, Wifi, Wind, Dog, Coffee, ArrowRight } from "lucide-react";
import URL from "../api";

const FACILITIES = [
  { icon: <Waves size={16} strokeWidth={2} />, label: "Pool", key: "swimmingPool" },
  { icon: <Dumbbell size={16} strokeWidth={2} />, label: "Gym", key: "gym" },
  { icon: <Sparkles size={16} strokeWidth={2} />, label: "Spa", key: "spa" },
  { icon: <Utensils size={16} strokeWidth={2} />, label: "Restaurant", key: "restaurant" },
  { icon: <ParkingCircle size={16} strokeWidth={2} />, label: "Parking", key: "parking" },
  { icon: <Wifi size={16} strokeWidth={2} />, label: "WiFi", key: "wifi" },
  { icon: <Wind size={16} strokeWidth={2} />, label: "AC", key: "ac" },
  { icon: <Dog size={16} strokeWidth={2} />, label: "Pets", key: "pets" },
  { icon: <Coffee size={16} strokeWidth={2} />, label: "Breakfast", key: "breakfast" }
];

const ROOM_TYPES = ["Single", "Double", "Twin", "Queen", "King", "Suite", "Deluxe", "Family"];

const formatLocation = (loc) => {
  if (!loc) return "N/A";
  if (typeof loc === "string") return loc;
  return [loc.cityname, loc.district?.districtname, loc.state?.Statename].filter(Boolean).join(", ") || "N/A";
};

export default function HotelsListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedFacilities, setSelectedFacilities] = useState(
    searchParams.get("facility") ? [searchParams.get("facility")] : []
  );
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    setLoading(true);
    axios.get(`${URL}/api/getHotelsByStatus/active`)
      .then(async res => {
        const hotelList = res.data.result || [];
        setHotels(hotelList);
        // Fetch rooms for each hotel
        const roomMap = {};
        await Promise.all(hotelList.map(async (h) => {
          try {
            const r = await axios.get(`${URL}/api/getRoomsByHotel/${h._id}`);
            roomMap[h._id] = r.data.result || [];
          } catch { roomMap[h._id] = []; }
        }));
        setRooms(roomMap);
      })
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleFacility = (key) => {
    setSelectedFacilities(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const getMinPrice = (hotelId) => {
    const r = rooms[hotelId] || [];
    if (!r.length) return null;
    return Math.min(...r.map(rm => rm.finalPrice || rm.price || 0));
  };

  const filtered = hotels.filter(hotel => {
    const hotelRooms = rooms[hotel._id] || [];
    const loc = formatLocation(hotel.location).toLowerCase();
    const name = (hotel.hotelName || "").toLowerCase();
    const q = search.toLowerCase();

    if (q && !name.includes(q) && !loc.includes(q) && !(hotel.ownerName || "").toLowerCase().includes(q)) return false;

    if (selectedFacilities.length > 0) {
      const hasAll = selectedFacilities.every(fac =>
        hotelRooms.some(r => r[fac] === true)
      );
      if (!hasAll) return false;
    }

    if (selectedRoomType) {
      const hasType = hotelRooms.some(r => r.roomType === selectedRoomType);
      if (!hasType) return false;
    }

    const minP = getMinPrice(hotel._id);
    if (minP !== null && (minP < priceRange[0] || minP > priceRange[1])) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return (getMinPrice(a._id) || 0) - (getMinPrice(b._id) || 0);
    if (sortBy === "price-desc") return (getMinPrice(b._id) || 0) - (getMinPrice(a._id) || 0);
    if (sortBy === "name") return a.hotelName.localeCompare(b.hotelName);
    return 0;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header Search Area */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "30px 5% 20px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={20} color="#64748b" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Where are you going?"
              style={{
                width: "100%", padding: "16px 16px 16px 48px", borderRadius: "100px",
                border: "1px solid #cbd5e1", fontSize: "16px", outline: "none",
                boxShadow: "0 4px 10px rgba(0,0,0,0.03)", transition: "all 0.2s"
              }}
              onFocus={e => {
                e.target.style.borderColor = "#2563eb";
                e.target.style.boxShadow = "0 4px 15px rgba(37,99,235,0.1)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "#cbd5e1";
                e.target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.03)";
              }}
            />
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: "14px 16px", borderRadius: "100px", border: "1px solid #cbd5e1",
                fontSize: "14px", outline: "none", color: "#0f172a", cursor: "pointer",
                background: "#fff", fontWeight: 500
              }}
            >
              <option value="default">Our Top Picks</option>
              <option value="price-asc">Price (lowest first)</option>
              <option value="price-desc">Price (highest first)</option>
              <option value="name">Property Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "32px auto", padding: "0 5%", display: "flex", gap: "32px", alignItems: "flex-start" }}>
        
        {/* Sidebar Filters */}
        <div style={{
          width: "280px", flexShrink: 0,
          background: "#fff", borderRadius: "16px", padding: "24px",
          border: "1px solid #e2e8f0", position: "sticky", top: "100px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
            <SlidersHorizontal size={20} color="#0f172a" />
            <h3 style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "18px" }}>Filters</h3>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0 0 24px" }} />

          {/* Price Range */}
          <div style={{ marginBottom: "32px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Your budget (per night)</h4>
            <input
              type="range" min="500" max="20000" step="500"
              value={priceRange[1]}
              onChange={e => setPriceRange([0, Number(e.target.value)])}
              style={{ width: "100%", accentColor: "#2563eb", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b", marginTop: "8px", fontWeight: 500 }}>
              <span>₹500</span><span>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0 0 24px" }} />

          {/* Facilities */}
          <div style={{ marginBottom: "32px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Facilities</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {FACILITIES.map(fac => (
                <label key={fac.key} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedFacilities.includes(fac.key)}
                    onChange={() => toggleFacility(fac.key)}
                    style={{ accentColor: "#2563eb", width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#475569" }}>
                    {fac.icon} {fac.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "0 0 24px" }} />

          {/* Room Type */}
          <div style={{ marginBottom: "32px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>Room Type</h4>
            <select
              value={selectedRoomType}
              onChange={e => setSelectedRoomType(e.target.value)}
              style={{
                width: "100%", padding: "12px", borderRadius: "8px",
                border: "1px solid #cbd5e1", fontSize: "14px", outline: "none",
                color: "#0f172a", cursor: "pointer"
              }}
            >
              <option value="">All Types</option>
              {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <button
            onClick={() => { setSearch(""); setSelectedFacilities([]); setSelectedRoomType(""); setPriceRange([0, 20000]); setSortBy("default"); }}
            style={{
              width: "100%", padding: "12px", borderRadius: "8px",
              border: "1px solid #cbd5e1", background: "#fff",
              color: "#0f172a", fontWeight: 600, fontSize: "14px", cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
          >
            Clear all filters
          </button>
        </div>

        {/* Listings */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
              {search ? `Properties in "${search}"` : "Explore all properties"}
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>
              {loading ? "Searching..." : `${sorted.length} properties found`}
            </p>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  height: "240px", borderRadius: "16px",
                  background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite"
                }} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px 20px", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}><Search size={48} color="#cbd5e1" /></div>
              <h3 style={{ color: "#0f172a", fontWeight: 700, fontSize: "20px", margin: "0 0 8px" }}>No exact matches found</h3>
              <p style={{ color: "#64748b", margin: 0 }}>Try changing or removing some of your filters.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {sorted.map(hotel => (
                <HotelHorizontalCard
                  key={hotel._id}
                  hotel={hotel}
                  rooms={rooms[hotel._id] || []}
                  minPrice={getMinPrice(hotel._id)}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

function HotelHorizontalCard({ hotel, rooms, minPrice, navigate }) {
  const loc = formatLocation(hotel.location);

  const facilityIcons = [];
  rooms.forEach(r => {
    if (r.swimmingPool && !facilityIcons.some(f => f.key === "swimmingPool")) facilityIcons.push({ key: "swimmingPool", icon: <Waves size={14} />, label: "Pool" });
    if (r.gym && !facilityIcons.some(f => f.key === "gym")) facilityIcons.push({ key: "gym", icon: <Dumbbell size={14} />, label: "Gym" });
    if (r.spa && !facilityIcons.some(f => f.key === "spa")) facilityIcons.push({ key: "spa", icon: <Sparkles size={14} />, label: "Spa" });
    if (r.restaurant && !facilityIcons.some(f => f.key === "restaurant")) facilityIcons.push({ key: "restaurant", icon: <Utensils size={14} />, label: "Restaurant" });
    if (r.wifi && !facilityIcons.some(f => f.key === "wifi")) facilityIcons.push({ key: "wifi", icon: <Wifi size={14} />, label: "Free WiFi" });
    if (r.parking && !facilityIcons.some(f => f.key === "parking")) facilityIcons.push({ key: "parking", icon: <ParkingCircle size={14} />, label: "Parking" });
  });

  const displayFacilities = facilityIcons.slice(0, 4);

  return (
    <div
      style={{
        display: "flex", background: "#fff", borderRadius: "16px", overflow: "hidden",
        border: "1px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = "#cbd5e1";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#e2e8f0";
      }}
      onClick={() => navigate(`/user/hotel/${hotel._id}`)}
    >
      <div style={{ width: "280px", flexShrink: 0, position: "relative" }}>
        <img
          src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"}
          alt={hotel.hotelName}
          style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: "240px" }}
        />
        <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", padding: "4px 8px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
          <Star size={12} fill="#eab308" color="#eab308" /> 4.8
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 700, color: "#2563eb" }}>
              {hotel.hotelName}
            </h3>
            <p style={{ margin: 0, color: "#475569", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={14} color="#64748b" /> {loc}
            </p>
          </div>
          {minPrice !== null && (
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b", fontWeight: 500 }}>Price from</p>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
                ₹{Math.round(minPrice).toLocaleString()}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>per night</p>
            </div>
          )}
        </div>

        <div style={{ flex: 1, marginTop: "12px", paddingRight: "100px" }}>
          <p style={{ 
            margin: "0 0 16px", color: "#475569", fontSize: "14px", lineHeight: "1.5",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" 
          }}>
            {hotel.description}
          </p>
          
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {displayFacilities.map((fac, i) => (
              <span key={i} style={{ 
                display: "flex", alignItems: "center", gap: "4px",
                fontSize: "12px", color: "#475569", border: "1px solid #e2e8f0", 
                padding: "4px 8px", borderRadius: "6px", fontWeight: 500 
              }}>
                {fac.icon} {fac.label}
              </span>
            ))}
            {facilityIcons.length > 4 && (
              <span style={{ fontSize: "12px", color: "#64748b", padding: "4px 8px", fontWeight: 600 }}>
                +{facilityIcons.length - 4} more
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto", paddingTop: "16px" }}>
          <button
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "10px 20px", borderRadius: "8px", border: "none",
              background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: "14px",
              cursor: "pointer"
            }}
          >
            See availability <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
