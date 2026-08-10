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

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    axios.get(`${URL}/api/getHotelsByStatus/active`, { params: { search: debouncedSearch, page, limit } })
      .then(async res => {
        const hotelList = res.data.result || [];
        setTotalPages(res.data.pagination?.totalPages || 1);
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
  }, [debouncedSearch, page, limit]);

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

    if (selectedFacilities.length > 0) {
      const hasAll = selectedFacilities.every(fac => {
        const normalizedFac = fac.toLowerCase().replace(/\s/g, '');
        const hasInHotel = (hotel.amenities || []).some(amenity => {
          const normalizedAmenity = amenity.toLowerCase().replace(/\s/g, '');
          return normalizedAmenity === normalizedFac ||
                 (normalizedFac === 'swimmingpool' && normalizedAmenity === 'pool') ||
                 (normalizedFac === 'pool' && normalizedAmenity === 'swimmingpool');
        });

        return hasInHotel;
      });
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
    <div style={{ minHeight: "100vh", background: "#050505", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header Search Area */}
      <div style={{ background: "#0a0a0c", borderBottom: "1px solid #1f1f22", padding: "30px 5% 20px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px", position: "relative", minWidth: 0 }}>
            <Search size={20} color="#a1a1aa" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Where are you going?"
              style={{
                width: "100%", padding: "16px 16px 16px 48px", borderRadius: "100px",
                border: "1px solid #1f1f22", fontSize: "16px", outline: "none",
                background: "#050505", color: "#fff", boxSizing: "border-box",
                boxShadow: "0 4px 10px rgba(0,0,0,0.5)", transition: "all 0.2s"
              }}
              onFocus={e => {
                e.target.style.borderColor = "#eab308";
                e.target.style.boxShadow = "0 4px 15px rgba(234, 179, 8, 0.2)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "#1f1f22";
                e.target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5)";
              }}
            />
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#a1a1aa", whiteSpace: "nowrap" }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: "14px 16px", borderRadius: "100px", border: "1px solid #1f1f22",
                fontSize: "14px", outline: "none", color: "#fff", cursor: "pointer",
                background: "#050505", fontWeight: 500, minWidth: "200px", boxSizing: "border-box"
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

      <div style={{ maxWidth: "1400px", margin: "32px auto", padding: "0 5%", display: "flex", gap: "32px", alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Sidebar Filters */}
        <div style={{
          width: "280px", flexShrink: 0,
          background: "#0a0a0c", borderRadius: "16px", padding: "24px",
          border: "1px solid #1f1f22", position: "sticky", top: "100px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
            <SlidersHorizontal size={20} color="#eab308" />
            <h3 style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: "18px", letterSpacing: "0.5px" }}>Filters</h3>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #1f1f22", margin: "0 0 24px" }} />

          {/* Price Range */}
          <div style={{ marginBottom: "32px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Your budget (per night)</h4>
            <input
              type="range" min="500" max="20000" step="500"
              value={priceRange[1]}
              onChange={e => setPriceRange([0, Number(e.target.value)])}
              style={{ width: "100%", accentColor: "#eab308", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#a1a1aa", marginTop: "8px", fontWeight: 500 }}>
              <span>₹500</span><span style={{ color: "#eab308" }}>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #1f1f22", margin: "0 0 24px" }} />

          {/* Facilities */}
          <div style={{ marginBottom: "32px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Facilities</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {FACILITIES.map(fac => (
                <label key={fac.key} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedFacilities.includes(fac.key)}
                    onChange={() => toggleFacility(fac.key)}
                    style={{ accentColor: "#eab308", width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#a1a1aa" }}>
                    {fac.icon} {fac.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #1f1f22", margin: "0 0 24px" }} />

          {/* Room Type */}
          <div style={{ marginBottom: "32px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Room Type</h4>
            <select
              value={selectedRoomType}
              onChange={e => setSelectedRoomType(e.target.value)}
              style={{
                width: "100%", padding: "12px", borderRadius: "8px",
                border: "1px solid #1f1f22", fontSize: "14px", outline: "none",
                color: "#fff", background: "#050505", cursor: "pointer"
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
              border: "1px solid #1f1f22", background: "#050505",
              color: "#a1a1aa", fontWeight: 600, fontSize: "14px", cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#a1a1aa"; e.currentTarget.style.borderColor = "#1f1f22"; }}
          >
            Clear all filters
          </button>
        </div>

        {/* Listings */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: "0 0 8px", letterSpacing: "0.5px" }}>
                {search ? `Properties in "${search}"` : "Explore all properties"}
              </h1>
              <p style={{ margin: 0, color: "#a1a1aa", fontSize: "15px", fontWeight: 300 }}>
                {loading ? "Searching..." : `${sorted.length} premium properties on this page`}
              </p>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <label style={{ fontSize: "14px", color: "#a1a1aa", fontWeight: 600 }}>Items per page:</label>
              <select 
                value={limit} 
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1); // Reset to page 1 when limit changes
                }}
                style={{
                  padding: "8px 12px", borderRadius: "8px", border: "1px solid #1f1f22",
                  background: "#0a0a0c", color: "#fff", outline: "none", cursor: "pointer"
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  height: "240px", borderRadius: "16px",
                  background: "linear-gradient(90deg, #111 25%, #222 50%, #111 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite"
                }} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px 20px", background: "#0a0a0c", borderRadius: "16px", border: "1px solid #1f1f22" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}><Search size={48} color="#eab308" /></div>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "20px", margin: "0 0 8px" }}>No exact matches found</h3>
              <p style={{ color: "#a1a1aa", margin: 0, fontWeight: 300 }}>Try changing or removing some of your filters.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {sorted.map(hotel => (
                <HotelHorizontalCard
                  key={hotel._id}
                  hotel={hotel}
                  rooms={rooms[hotel._id] || []}
                  minPrice={getMinPrice(hotel._id)}
                  navigate={navigate}
                />
              ))}

              {/* Pagination Controls */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", padding: "16px", background: "#0a0a0c", borderRadius: "12px", border: "1px solid #1f1f22" }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "10px 20px", borderRadius: "8px", border: "1px solid #1f1f22",
                    background: page === 1 ? "#111" : "#050505", color: page === 1 ? "#333" : "#fff",
                    fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Previous
                </button>

                <span style={{ fontSize: "14px", fontWeight: 600, color: "#a1a1aa" }}>
                  Page <span style={{ color: "#eab308" }}>{page}</span> of {totalPages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  style={{
                    padding: "10px 20px", borderRadius: "8px", border: "1px solid #1f1f22",
                    background: page === totalPages || totalPages === 0 ? "#111" : "#050505", color: page === totalPages || totalPages === 0 ? "#333" : "#fff",
                    fontWeight: 600, cursor: page === totalPages || totalPages === 0 ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Next
                </button>
              </div>
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
  
  // Helper to add if not present
  const addFac = (key, icon, label) => {
    if (!facilityIcons.some(f => f.key === key)) {
      facilityIcons.push({ key, icon, label });
    }
  };

  // 1. Check room-level amenities
  rooms.forEach(r => {
    if (r.swimmingPool) addFac("swimmingPool", <Waves size={14} color="#eab308" />, "Pool");
    if (r.gym) addFac("gym", <Dumbbell size={14} color="#eab308" />, "Gym");
    if (r.spa) addFac("spa", <Sparkles size={14} color="#eab308" />, "Spa");
    if (r.restaurant) addFac("restaurant", <Utensils size={14} color="#eab308" />, "Restaurant");
    if (r.wifi) addFac("wifi", <Wifi size={14} color="#eab308" />, "Free WiFi");
    if (r.parking) addFac("parking", <ParkingCircle size={14} color="#eab308" />, "Parking");
    if (r.ac) addFac("ac", <Wind size={14} color="#eab308" />, "AC");
  });

  // 2. Check hotel-level amenities
  if (hotel.amenities && hotel.amenities.length > 0) {
    hotel.amenities.forEach(am => {
      const norm = am.toLowerCase().replace(/\s/g, '');
      if (norm === 'swimmingpool' || norm === 'pool') addFac("swimmingPool", <Waves size={14} color="#eab308" />, "Pool");
      if (norm === 'gym') addFac("gym", <Dumbbell size={14} color="#eab308" />, "Gym");
      if (norm === 'spa') addFac("spa", <Sparkles size={14} color="#eab308" />, "Spa");
      if (norm === 'restaurant') addFac("restaurant", <Utensils size={14} color="#eab308" />, "Restaurant");
      if (norm === 'wifi') addFac("wifi", <Wifi size={14} color="#eab308" />, "Free WiFi");
      if (norm === 'parking') addFac("parking", <ParkingCircle size={14} color="#eab308" />, "Parking");
      if (norm === 'ac') addFac("ac", <Wind size={14} color="#eab308" />, "AC");
    });
  }

  const displayFacilities = facilityIcons.slice(0, 4);

  return (
    <div
      style={{
        display: "flex", flexWrap: "wrap", background: "#0a0a0c", borderRadius: "24px", overflow: "hidden",
        border: "1px solid #1f1f22", cursor: "pointer", transition: "transform 0.3s, border-color 0.3s",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "rgba(234, 179, 8, 0.4)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#1f1f22";
      }}
      onClick={() => navigate(`/user/hotel/${hotel._id}`)}
    >
      <div style={{ width: "320px", flexShrink: 0, position: "relative" }}>
        <img
          src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"}
          alt={hotel.hotelName}
          style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: "260px" }}
        />
        <div style={{ position: "absolute", top: "16px", left: "16px", background: "rgba(10, 10, 12, 0.8)", backdropFilter: "blur(4px)", padding: "6px 12px", borderRadius: "100px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Star size={14} fill="#eab308" color="#eab308" /> 4.8
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", minWidth: "300px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 700, color: "#fff", letterSpacing: "0.5px" }}>
              {hotel.hotelName}
            </h3>
            <p style={{ margin: 0, color: "#a1a1aa", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", fontWeight: 300 }}>
              <MapPin size={14} color="#eab308" /> {loc}
            </p>
          </div>
          {minPrice !== null && (
            <div style={{ textAlign: "right", background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#a1a1aa", fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px" }}>Price from</p>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#eab308", letterSpacing: "-0.5px" }}>
                ₹{Math.round(minPrice).toLocaleString()}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#a1a1aa" }}>per night</p>
            </div>
          )}
        </div>

        <div style={{ flex: 1, marginTop: "16px" }}>
          <p style={{ 
            margin: "0 0 20px", color: "#a1a1aa", fontSize: "15px", lineHeight: "1.6", fontWeight: 300,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" 
          }}>
            {hotel.description}
          </p>
          
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {displayFacilities.map((fac, i) => (
              <span key={i} style={{ 
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "13px", color: "#fff", background: "rgba(234, 179, 8, 0.05)", border: "1px solid rgba(234, 179, 8, 0.2)", 
                padding: "6px 12px", borderRadius: "100px", fontWeight: 500 
              }}>
                {fac.icon} {fac.label}
              </span>
            ))}
            {facilityIcons.length > 4 && (
              <span style={{ fontSize: "13px", color: "#a1a1aa", padding: "6px 12px", fontWeight: 600 }}>
                +{facilityIcons.length - 4} more
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <button
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 28px", borderRadius: "100px", border: "none",
              background: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)", color: "#050505", fontWeight: 800, fontSize: "15px",
              cursor: "pointer", transition: "transform 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            See availability <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
