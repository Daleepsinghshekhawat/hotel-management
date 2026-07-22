import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import URL from "../api";

const FACILITIES = [
  { icon: "🏊", label: "Pool", key: "swimmingPool" },
  { icon: "💪", label: "Gym", key: "gym" },
  { icon: "🧖", label: "Spa", key: "spa" },
  { icon: "🍽️", label: "Restaurant", key: "restaurant" },
  { icon: "🅿️", label: "Parking", key: "parking" },
  { icon: "📶", label: "WiFi", key: "wifi" },
  { icon: "❄️", label: "AC", key: "ac" },
  { icon: "🐾", label: "Pet Friendly", key: "pets" },
  { icon: "🍳", label: "Breakfast", key: "breakfast" },
  { icon: "🏧", label: "ATM", key: "lift" },
];

const ROOM_TYPES = ["Single", "Double", "Twin", "Queen", "King", "Suite", "Deluxe", "Family", "Executive", "Presidential"];

const formatLocation = (loc) => {
  if (!loc) return "N/A";
  if (typeof loc === "string") return loc;
  return [loc.cityname, loc.district?.districtname, loc.state?.Statename].filter(Boolean).join(", ") || "N/A";
};

export default function HotelsListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState({}); // hotelId -> rooms[]
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedFacilities, setSelectedFacilities] = useState(
    searchParams.get("facility") ? [searchParams.get("facility")] : []
  );
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [sortBy, setSortBy] = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);

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
    <div style={{ minHeight: "100vh", background: "#f8faff" }}>
      {/* Page Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b, #4f46e5)",
        padding: "60px 5% 40px", color: "#fff"
      }}>
        <h1 style={{ margin: "0 0 8px", fontSize: "36px", fontWeight: 800, letterSpacing: "-1px" }}>
          🏨 All Hotels
        </h1>
        <p style={{ margin: 0, color: "#c7d2fe", fontSize: "16px" }}>
          {loading ? "Loading..." : `${sorted.length} hotels found`}
        </p>
      </div>

      <div style={{ display: "flex", gap: "0", padding: "0 5%", marginTop: "32px" }}>
        {/* Sidebar Filters */}
        <div style={{
          width: "270px", flexShrink: 0, marginRight: "32px",
          background: "#fff", borderRadius: "20px", padding: "28px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", height: "fit-content",
          position: "sticky", top: "90px"
        }}>
          <h3 style={{ margin: "0 0 24px", fontWeight: 800, color: "#1e293b", fontSize: "18px" }}>
            🎛 Filters
          </h3>

          {/* Search */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "8px" }}>
              SEARCH
            </label>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Hotel name, city..."
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "10px",
                border: "2px solid #e2e8f0", fontSize: "14px",
                outline: "none", boxSizing: "border-box", color: "#1e293b",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "8px" }}>
              MAX PRICE: ₹{priceRange[1].toLocaleString()}
            </label>
            <input
              type="range" min="500" max="20000" step="500"
              value={priceRange[1]}
              onChange={e => setPriceRange([0, Number(e.target.value)])}
              style={{ width: "100%", accentColor: "#6366f1" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
              <span>₹500</span><span>₹20,000</span>
            </div>
          </div>

          {/* Room Type */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "8px" }}>
              ROOM TYPE
            </label>
            <select
              value={selectedRoomType}
              onChange={e => setSelectedRoomType(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "10px",
                border: "2px solid #e2e8f0", fontSize: "14px", outline: "none",
                color: "#1e293b", boxSizing: "border-box", cursor: "pointer"
              }}
            >
              <option value="">All Types</option>
              {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Facilities */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "12px" }}>
              FACILITIES
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {FACILITIES.map(fac => (
                <label key={fac.key} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedFacilities.includes(fac.key)}
                    onChange={() => toggleFacility(fac.key)}
                    style={{ accentColor: "#6366f1", width: "16px", height: "16px" }}
                  />
                  <span style={{ fontSize: "14px", color: "#475569" }}>{fac.icon} {fac.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "8px" }}>
              SORT BY
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "10px",
                border: "2px solid #e2e8f0", fontSize: "14px", outline: "none",
                color: "#1e293b", boxSizing: "border-box"
              }}
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          <button
            onClick={() => { setSearch(""); setSelectedFacilities([]); setSelectedRoomType(""); setPriceRange([0, 20000]); setSortBy("default"); }}
            style={{
              width: "100%", padding: "11px", borderRadius: "10px",
              border: "2px solid #e2e8f0", background: "#f8faff",
              color: "#64748b", fontWeight: 600, fontSize: "14px", cursor: "pointer"
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Hotel Grid */}
        <div style={{ flex: 1, paddingBottom: "60px" }}>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{
                  height: "380px", borderRadius: "20px",
                  background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite"
                }} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "#94a3b8" }}>
              <div style={{ fontSize: "60px", marginBottom: "16px" }}>🏨</div>
              <h3 style={{ color: "#475569", fontWeight: 700 }}>No hotels match your filters</h3>
              <p>Try adjusting your search or clearing filters.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {sorted.map(hotel => (
                <HotelCard
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

function HotelCard({ hotel, rooms, minPrice, navigate }) {
  const loc = formatLocation(hotel.location);

  const facilityIcons = [];
  rooms.forEach(r => {
    if (r.swimmingPool) facilityIcons.push("🏊");
    if (r.gym) facilityIcons.push("💪");
    if (r.spa) facilityIcons.push("🧖");
    if (r.restaurant) facilityIcons.push("🍽️");
    if (r.wifi) facilityIcons.push("📶");
    if (r.parking) facilityIcons.push("🅿️");
  });
  const uniqueFacilities = [...new Set(facilityIcons)].slice(0, 4);

  return (
    <div
      style={{
        borderRadius: "20px", overflow: "hidden", background: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)", transition: "all 0.3s",
        cursor: "pointer", display: "flex", flexDirection: "column"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)";
      }}
      onClick={() => navigate(`/user/hotel/${hotel._id}`)}
    >
      <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
        <img
          src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"}
          alt={hotel.hotelName}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
        />
        {rooms.length > 0 && (
          <div style={{
            position: "absolute", top: "12px", left: "12px",
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            color: "#fff", padding: "5px 12px", borderRadius: "100px",
            fontSize: "12px", fontWeight: 600
          }}>
            {rooms.length} Room{rooms.length > 1 ? "s" : ""} Available
          </div>
        )}
      </div>

      <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 700, color: "#1e293b" }}>
          {hotel.hotelName}
        </h3>
        <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
          📍 {loc}
        </p>

        {uniqueFacilities.length > 0 && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            {uniqueFacilities.map((ic, i) => (
              <span key={i} style={{
                fontSize: "16px", background: "#f8faff",
                borderRadius: "8px", padding: "4px 8px"
              }}>{ic}</span>
            ))}
          </div>
        )}

        <div style={{ marginTop: "auto" }}>
          {minPrice !== null && (
            <p style={{ margin: "0 0 12px", color: "#1e293b", fontSize: "15px" }}>
              Starting from <strong style={{ color: "#6366f1", fontSize: "18px" }}>₹{Math.round(minPrice).toLocaleString()}</strong>
              <span style={{ color: "#94a3b8", fontSize: "12px" }}>/night</span>
            </p>
          )}
          <button
            onClick={e => { e.stopPropagation(); navigate(`/user/hotel/${hotel._id}`); }}
            style={{
              width: "100%", padding: "12px", borderRadius: "12px", border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", fontWeight: 700, fontSize: "14px",
              cursor: "pointer", transition: "opacity 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            View & Book Now 🛎️
          </button>
        </div>
      </div>
    </div>
  );
}
