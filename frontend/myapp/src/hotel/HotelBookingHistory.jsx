import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import URL from "../api";
import useDebounce from "../hooks/useDebounce";

export default function HotelBookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [contactModal, setContactModal] = useState(null);
  const [copied, setCopied] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // 1. Get all hotels owned by this user
      const hotelRes = await axios.get(`${URL}/api/getHotelsByAdmin/${user.email}`);
      const hotels = hotelRes.data.result || [];
      
      // 2. Fetch bookings for each hotel concurrently
      const bookingPromises = hotels.map(hotel => 
        axios.get(`${URL}/api/getBookingsByHotel/${hotel._id}`)
      );
      
      const responses = await Promise.all(bookingPromises);
      
      // 3. Aggregate bookings and attach hotel info if not present
      let allBookings = [];
      responses.forEach((res, index) => {
        const hotelBookings = res.data.result || [];
        const hotelInfo = hotels[index];
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Inject hotel info into booking for easy access in the UI since it is returned as a string ID
        const enrichedBookings = hotelBookings
          .filter(b => {
            const checkOutDate = new Date(b.checkOut);
            const isPast = checkOutDate < today;
            return b.status === "completed" || b.status === "cancelled" || isPast;
          })
          .map(b => ({
            ...b,
            hotel: { _id: hotelInfo._id, hotelName: hotelInfo.hotelName }
          }));
        allBookings = [...allBookings, ...enrichedBookings];
      });
      
      // Sort by createdAt descending
      allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setBookings(allBookings);
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.email) {
      fetchBookings();
    }
  }, [user.email]);

  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";
  };

  const statusBadge = (status) => {
    const styles = {
      confirmed: { bg: "#dcfce7", color: "#15803d" },
      completed: { bg: "#e0f2fe", color: "#0369a1" },
      cancelled: { bg: "#fee2e2", color: "#dc2626" },
      pending: { bg: "#fef3c7", color: "#d97706" },
    };
    const s = styles[status] || { bg: "#f1f5f9", color: "#64748b" };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "capitalize",
        }}
      >
        {status || "Unknown"}
      </span>
    );
  };

  const filtered = bookings.filter((b) => {
    const matchesStatus =
      statusFilter === "all" || b.status === statusFilter;

    let matchesSearch = true;
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      matchesSearch = (
        (b.guestName && b.guestName.toLowerCase().includes(term)) ||
        (b.guestEmail && b.guestEmail.toLowerCase().includes(term)) ||
        (b.hotel?.hotelName && b.hotel.hotelName.toLowerCase().includes(term)) ||
        (b.room?.roomName && b.room.roomName.toLowerCase().includes(term))
      );
    }

    return matchesStatus && matchesSearch;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filtered.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: "#0f172a", fontWeight: 700 }}>
            📅 My Hotels Bookings
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Track and manage past room reservations for all your owned hotels.
          </p>
        </div>
        <a
          href={`${URL}/api/pdf/bookings?adminEmail=${user.email}&type=history`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "10px 16px", background: "#10b981", color: "#fff", border: "none",
            borderRadius: "8px", fontWeight: 600, fontSize: "14px", textDecoration: "none",
            display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)"
          }}
        >
          📄 Download Booking History (PDF)
        </a>
      </div>

      {bookings.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderRadius: "12px", padding: "20px", border: "1px solid #bfdbfe" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Past Bookings</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#1e40af", marginTop: "4px" }}>{bookings.length}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #eff6ff, #e0f2fe)", borderRadius: "12px", padding: "20px", border: "1px solid #bae6fd" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.5px" }}>Completed</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#0369a1", marginTop: "4px" }}>{bookings.filter(b => b.status === "completed").length}</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #f0fdfa, #ccfbf1)", borderRadius: "12px", padding: "20px", border: "1px solid #99f6e4" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.5px" }}>Revenue (Completed)</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#115e59", marginTop: "4px", fontFamily: "monospace" }}>
              ₹{bookings.filter(b => b.status === "completed").reduce((sum, b) => sum + (b.hotelEarnings || b.totalAmount || 0), 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          placeholder="🔍 Search by guest, hotel, or room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "250px", padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", background: "#f8fafc", cursor: "pointer", minWidth: "160px" }}
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>⏳ Loading booking history...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 40px", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>No Bookings Found</h3>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            {search || statusFilter !== "all" ? "No bookings match your current search or filter." : "There are no booking records for your hotels yet."}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Booking ID</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Hotel</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Room</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Guest</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Check-In</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Check-Out</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600 }}>Amount</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600, textAlign: "center" }}>Status</th>
                <th style={{ padding: "14px 16px", color: "#475569", fontWeight: 600, textAlign: "center" }}>Contact</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((b) => (
                <tr key={b._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1e293b" }}>
                    <code>{b.bookingId || "N/A"}</code>
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1e293b" }}>{b.hotel?.hotelName || "N/A"}</td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    <div>{b.room?.roomName || "N/A"}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{b.room?.roomType || ""}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569" }}>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{b.guestName || "N/A"}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{b.guestEmail || ""}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{b.guestPhone || ""}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#475569", whiteSpace: "nowrap" }}>{formatDate(b.checkIn)}</td>
                  <td style={{ padding: "14px 16px", color: "#475569", whiteSpace: "nowrap" }}>{formatDate(b.checkOut)}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                    ₹{(b.hotelEarnings || b.totalAmount || 0).toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>{statusBadge(b.status)}</td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      <button
                        onClick={() => setContactModal(b)}
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#3b82f6",
                          color: "#fff",
                          border: "none",
                          fontWeight: 600,
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        ✉️ Contact
                      </button>
                      <a
                        href={`${URL}/api/pdf/booking/${b._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#10b981",
                          color: "#fff",
                          border: "none",
                          fontWeight: 600,
                          fontSize: "12px",
                          cursor: "pointer",
                          textDecoration: "none"
                        }}
                      >
                        PDF
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && !loading && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", marginTop: "16px", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filtered.length)} of {filtered.length} entries
            </span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", outline: "none", color: "#334155" }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1",
                background: currentPage === 1 ? "#f1f5f9" : "#fff",
                color: currentPage === 1 ? "#94a3b8" : "#334155",
                cursor: currentPage === 1 ? "not-allowed" : "pointer"
              }}
            >
              Previous
            </button>
            
            <span style={{ fontSize: "14px", color: "#334155", fontWeight: 600 }}>
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{
                padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1",
                background: currentPage === totalPages || totalPages === 0 ? "#f1f5f9" : "#fff",
                color: currentPage === totalPages || totalPages === 0 ? "#94a3b8" : "#334155",
                cursor: currentPage === totalPages || totalPages === 0 ? "not-allowed" : "pointer"
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "400px", borderRadius: "16px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>Contact Guest</h3>
              <button onClick={() => setContactModal(null)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "18px", color: "#64748b" }}>✖</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Guest Name</label>
                <div style={{ padding: "10px 14px", background: "#f1f5f9", borderRadius: "8px", color: "#1e293b", fontWeight: 600, fontSize: "14px" }}>
                  {contactModal.guestName || "N/A"}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Email Address</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1, padding: "10px 14px", background: "#f1f5f9", borderRadius: "8px", color: "#1e293b", fontSize: "14px" }}>
                    {contactModal.guestEmail || "N/A"}
                  </div>
                  {contactModal.guestEmail && (
                    <button onClick={() => handleCopy(contactModal.guestEmail, "email")} style={{ padding: "0 14px", background: "#e2e8f0", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>
                      {copied === "email" ? "✅" : "📋"}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>Phone Number</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1, padding: "10px 14px", background: "#f1f5f9", borderRadius: "8px", color: "#1e293b", fontSize: "14px" }}>
                    {contactModal.guestPhone || "N/A"}
                  </div>
                  {contactModal.guestPhone && (
                    <button onClick={() => handleCopy(contactModal.guestPhone, "phone")} style={{ padding: "0 14px", background: "#e2e8f0", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}>
                      {copied === "phone" ? "✅" : "📋"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {contactModal.guestEmail && (
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <a 
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactModal.guestEmail}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, display: "block", textAlign: "center", padding: "12px", background: "#ea4335", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", textDecoration: "none", boxSizing: "border-box" }}
                >
                  Compose in Gmail
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
