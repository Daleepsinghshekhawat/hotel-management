import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import URL from "../api";

const formatLocation = (location) => {
  if (!location) return "N/A";
  if (typeof location === "string") return location;
  const city = location.cityname || "";
  const district = location.district?.districtname || "";
  const state = location.state?.Statename || "";
  return [city, district, state].filter(Boolean).join(", ") || "N/A";
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    activeHotels: 0,
    totalUsers: 0,
  });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      if (!user.email) return;
      setLoading(true);
      try {
        const [requestsRes, hotelsRes, usersRes] = await Promise.all([
          axios.get(`${URL}/api/getHotelRequestsByAdmin/${user.email}`),
          axios.get(`${URL}/api/getHotelsByAdmin/${user.email}`),
          axios.get(`${URL}/api/getUsersByRole/all`),
        ]);

        const requests = requestsRes.data.result || [];
        const allUsers = (usersRes.data.result || []).filter(
          (u) => u.role !== "admin" && u.role !== "superadmin"
        );

        setRecent(requests.slice(0, 5));
        setStats({
          pending: requests.filter((r) => r.status === "pending").length,
          approved: requests.filter((r) => r.status === "approved").length,
          rejected: requests.filter((r) => r.status === "rejected").length,
          activeHotels: (hotelsRes.data.result || []).length,
          totalUsers: allUsers.length,
        });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.email]);

  const statCards = [
    { label: "Pending Approval", count: stats.pending, bg: "#fef9c3", color: "#854d0e", icon: "⏳" },
    { label: "Approved", count: stats.approved, bg: "#dcfce7", color: "#166534", icon: "✅" },
    { label: "Rejected", count: stats.rejected, bg: "#fee2e2", color: "#991b1b", icon: "❌" },
    { label: "Live Hotels", count: stats.activeHotels, bg: "#dbeafe", color: "#1d4ed8", icon: "🏨" },
    { label: "Total Users", count: stats.totalUsers, bg: "#f3e8ff", color: "#6b21a8", icon: "👥" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
          Welcome, {user.name || "Admin"}
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Add hotels and track approval status from superadmin.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Loading dashboard...</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
            {statCards.map((stat) => (
              <div
                key={stat.label}
                style={{
                  flex: "1 1 160px",
                  background: stat.bg,
                  borderRadius: "14px",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <span style={{ fontSize: "28px" }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                    {stat.count}
                  </div>
                  <div style={{ fontSize: "12px", color: stat.color, fontWeight: 600, marginTop: "2px" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
            <Link
              to="/adminpage/add-hotel"
              style={{
                padding: "12px 20px",
                background: "#2563eb",
                color: "#fff",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              ➕ Add New Hotel
            </Link>
             <Link
              to="/adminpage/hotels"
              style={{
                padding: "12px 20px",
                background: "#e2e8f0",
                color: "#334155",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              🏨 View All Hotels
            </Link>
          </div>

          <h3 style={{ margin: "0 0 16px", color: "#0f172a" }}>Recent Submissions</h3>
          {recent.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px dashed #cbd5e1",
                color: "#94a3b8",
              }}
            >
              No hotel submissions yet. Add your first hotel to get started.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {recent.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    background: "#fff",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.hotelName}</div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {formatLocation(item.location)} · {item.status}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background:
                        item.status === "approved"
                          ? "#dcfce7"
                          : item.status === "rejected"
                            ? "#fee2e2"
                            : "#fef9c3",
                      color:
                        item.status === "approved"
                          ? "#166534"
                          : item.status === "rejected"
                            ? "#991b1b"
                            : "#854d0e",
                      textTransform: "capitalize",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import URL from "../api";
// import useTheme from "../useTheme"; // Change path if needed

// const formatLocation = (location) => {
//   if (!location) return "N/A";
//   if (typeof location === "string") return location;

//   const city = location.cityname || "";
//   const district = location.district?.districtname || "";
//   const state = location.state?.Statename || "";

//   return [city, district, state].filter(Boolean).join(", ") || "N/A";
// };

// export default function Dashboard() {
//   const { theme, toggleTheme } = useTheme();

//   const isDark = theme === "dark";

//   const colors = {
//     background: isDark ? "#0f172a" : "#ffffff",
//     card: isDark ? "#1e293b" : "#ffffff",
//     text: isDark ? "#f8fafc" : "#0f172a",
//     subText: isDark ? "#cbd5e1" : "#64748b",
//     border: isDark ? "#334155" : "#e2e8f0",
//   };

//   const [stats, setStats] = useState({
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//     activeHotels: 0,
//   });

//   const [recent, setRecent] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const user = JSON.parse(localStorage.getItem("user") || "{}");

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!user.email) return;

//       setLoading(true);

//       try {
//         const [requestsRes, hotelsRes] = await Promise.all([
//           axios.get(`${URL}/api/getHotelRequestsByAdmin/${user.email}`),
//           axios.get(`${URL}/api/getHotelsByAdmin/${user.email}`),
//         ]);

//         const requests = requestsRes.data.result || [];

//         setRecent(requests.slice(0, 5));

//         setStats({
//           pending: requests.filter((r) => r.status === "pending").length,
//           approved: requests.filter((r) => r.status === "approved").length,
//           rejected: requests.filter((r) => r.status === "rejected").length,
//           activeHotels: (hotelsRes.data.result || []).length,
//         });
//       } catch (err) {
//         console.log(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [user.email]);

//   const statCards = [
//     {
//       label: "Pending Approval",
//       count: stats.pending,
//       bg: "#FEF3C7",
//       color: "#92400E",
//       icon: "⏳",
//     },
//     {
//       label: "Approved",
//       count: stats.approved,
//       bg: "#DCFCE7",
//       color: "#166534",
//       icon: "✅",
//     },
//     {
//       label: "Rejected",
//       count: stats.rejected,
//       bg: "#FEE2E2",
//       color: "#991B1B",
//       icon: "❌",
//     },
//     {
//       label: "Live Hotels",
//       count: stats.activeHotels,
//       bg: "#DBEAFE",
//       color: "#1D4ED8",
//       icon: "🏨",
//     },
//   ];

//   return (
//     <div
//       style={{
//         fontFamily: "'Segoe UI', sans-serif",
//         background: colors.background,
//         color: colors.text,
//         minHeight: "100vh",
//         transition: "0.3s",
//         padding: "10px",
//       }}
//     >
//       <div style={{ marginBottom: "25px" }}>
//         <h2
//           style={{
//             margin: "0 0 5px",
//             color: colors.text,
//           }}
//         >
//           Welcome, {user.name || "Admin"}
//         </h2>

//         <p
//           style={{
//             color: colors.subText,
//           }}
//         >
//           Add hotels and track approval status from superadmin.
//         </p>

//         <button
//           onClick={toggleTheme}
//           style={{
//             marginTop: "18px",
//             padding: "10px 20px",
//             border: "none",
//             borderRadius: "8px",
//             cursor: "pointer",
//             fontWeight: "bold",
//             background: isDark ? "#ffffff" : "#1e293b",
//             color: isDark ? "#000000" : "#ffffff",
//           }}
//         >
//           {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
//         </button>
//       </div>

//       {loading ? (
//         <div
//           style={{
//             textAlign: "center",
//             padding: "50px",
//             color: colors.subText,
//           }}
//         >
//           Loading Dashboard...
//         </div>
//       ) : (
//         <>
//           <div
//             style={{
//               display: "flex",
//               gap: "16px",
//               flexWrap: "wrap",
//               marginBottom: "30px",
//             }}
//           >
//             {statCards.map((stat) => (
//               <div
//                 key={stat.label}
//                 style={{
//                   flex: "1 1 170px",
//                   background: stat.bg,
//                   padding: "20px",
//                   borderRadius: "12px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "15px",
//                 }}
//               >
//                 <span style={{ fontSize: "30px" }}>{stat.icon}</span>

//                 <div>
//                   <div
//                     style={{
//                       fontSize: "28px",
//                       fontWeight: "bold",
//                       color: stat.color,
//                     }}
//                   >
//                     {stat.count}
//                   </div>

//                   <div
//                     style={{
//                       color: stat.color,
//                       fontWeight: "600",
//                     }}
//                   >
//                     {stat.label}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div
//             style={{
//               display: "flex",
//               gap: "12px",
//               marginBottom: "30px",
//             }}
//           >
//             <Link
//               to="/adminpage/add-hotel"
//               style={{
//                 padding: "12px 20px",
//                 background: "#2563EB",
//                 color: "#fff",
//                 borderRadius: "8px",
//                 textDecoration: "none",
//                 fontWeight: "bold",
//               }}
//             >
//               ➕ Add New Hotel
//             </Link>

//             <Link
//               to="/adminpage/hotels"
//               style={{
//                 padding: "12px 20px",
//                 background: isDark ? "#334155" : "#E2E8F0",
//                 color: colors.text,
//                 borderRadius: "8px",
//                 textDecoration: "none",
//                 fontWeight: "bold",
//               }}
//             >
//               🏨 View All Hotels
//             </Link>
//           </div>

//           <h3
//             style={{
//               color: colors.text,
//               marginBottom: "20px",
//             }}
//           >
//             Recent Submissions
//           </h3>

//           {recent.length === 0 ? (
//             <div
//               style={{
//                 padding: "40px",
//                 textAlign: "center",
//                 background: colors.card,
//                 border: `1px dashed ${colors.border}`,
//                 borderRadius: "12px",
//                 color: colors.subText,
//               }}
//             >
//               No hotel submissions yet.
//             </div>
//           ) : (
//             <div
//               style={{
//                 display: "grid",
//                 gap: "15px",
//               }}
//             >
//               {recent.map((item) => (
//                 <div
//                   key={item._id}
//                   style={{
//                     background: colors.card,
//                     border: `1px solid ${colors.border}`,
//                     borderRadius: "12px",
//                     padding: "15px",
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                   }}
//                 >
//                   <div>
//                     <div
//                       style={{
//                         fontWeight: "bold",
//                         color: colors.text,
//                       }}
//                     >
//                       {item.hotelName}
//                     </div>

//                     <div
//                       style={{
//                         color: colors.subText,
//                         fontSize: "14px",
//                       }}
//                     >
//                       {formatLocation(item.location)}
//                     </div>
//                   </div>

//                   <span
//                     style={{
//                       padding: "6px 12px",
//                       borderRadius: "30px",
//                       fontWeight: "bold",
//                       background:
//                         item.status === "approved"
//                           ? "#DCFCE7"
//                           : item.status === "rejected"
//                           ? "#FEE2E2"
//                           : "#FEF3C7",
//                       color:
//                         item.status === "approved"
//                           ? "#166534"
//                           : item.status === "rejected"
//                           ? "#991B1B"
//                           : "#92400E",
//                       textTransform: "capitalize",
//                     }}
//                   >
//                     {item.status}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
