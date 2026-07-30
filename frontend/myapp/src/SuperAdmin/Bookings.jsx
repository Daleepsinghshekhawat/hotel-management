import React, { useEffect, useState } from "react";
import axios from "axios";
import URL from "../api";
import { Eye, Download, Search, ChevronLeft, ChevronRight, X, Calendar, MapPin, User, Receipt, CreditCard } from "lucide-react";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${URL}/api/getAllBookings`);
        if (response.data.success) {
          setBookings(response.data.result || []);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
      case "completed":
      case "checked_in":
        return { bg: "#dcfce7", text: "#166534" }; // Green
      case "pending":
        return { bg: "#fef9c3", text: "#854d0e" }; // Yellow
      case "cancelled":
        return { bg: "#fee2e2", text: "#991b1b" }; // Red
      default:
        return { bg: "#f1f5f9", text: "#475569" }; // Gray
    }
  };

  // Filter Logic
  const filteredBookings = bookings.filter((b) => {
    const searchString = searchTerm.toLowerCase();
    const idMatch = b.bookingId?.toLowerCase().includes(searchString) || b._id?.toLowerCase().includes(searchString);
    const guestMatch = b.guestName?.toLowerCase().includes(searchString) || b.guestEmail?.toLowerCase().includes(searchString);
    const hotelMatch = b.hotel?.hotelName?.toLowerCase().includes(searchString);
    const matchesSearch = !searchTerm || idMatch || guestMatch || hotelMatch;

    const matchesStatus = statusFilter === "All" || b.status.toLowerCase() === statusFilter.toLowerCase();

    let matchesDate = true;
    if (b.checkIn) {
      const checkInDate = new Date(b.checkIn);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      
      if (from) {
        from.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && checkInDate >= from;
      }
      if (to) {
        to.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && checkInDate <= to;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredBookings.length, currentPage, totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = () => {
    alert("Exporting data as CSV...");
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "10px" }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "24px", color: "#0f172a", fontWeight: 700 }}>
            All Bookings
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Dashboard / All Bookings
          </p>
        </div>
        <button 
          onClick={handleExport}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#ffffff", border: "1px solid #e2e8f0", color: "#334155",
            padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
            cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }}
        >
          <Download size={16} /> Export
        </button>
      </div>

      {/* FILTERS SECTION */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
          <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
          <input
            type="text"
            placeholder="Search by booking ID, hotel or user"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%", padding: "10px 10px 10px 38px", borderRadius: "8px",
              border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box"
            }}
          />
        </div>

        {/* From Date */}
        <div style={{ position: "relative", width: "160px" }}>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              width: "100%", padding: "10px", borderRadius: "8px",
              border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box",
              color: fromDate ? "#334155" : "#94a3b8"
            }}
          />
        </div>

        {/* To Date */}
        <div style={{ position: "relative", width: "160px" }}>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              width: "100%", padding: "10px", borderRadius: "8px",
              border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box",
              color: toDate ? "#334155" : "#94a3b8"
            }}
          />
        </div>

        {/* Status Dropdown */}
        <div style={{ width: "160px" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: "100%", padding: "10px", borderRadius: "8px",
              border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", boxSizing: "border-box",
              backgroundColor: "#fff", color: "#334155", cursor: "pointer"
            }}
          >
            <option value="All">Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
          overflow: "hidden"
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>Loading bookings...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={thStyle}>Booking ID</th>
                  <th style={thStyle}>Room</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Hotel</th>
                  <th style={thStyle}>Check In</th>
                  <th style={thStyle}>Check Out</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                  <th style={{...thStyle, textAlign: "center"}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.length > 0 ? paginatedBookings.map((booking) => {
                  const statusColors = getStatusColor(booking.status);
                  return (
                    <tr key={booking._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: "#3b82f6" }}>
                          #{booking.bookingId || booking._id.substring(0, 8)}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, width: "70px" }}>
                        {booking.room?.images && booking.room.images[0] ? (
                          <img 
                            src={booking.room.images[0].startsWith("http") ? booking.room.images[0] : `${URL}/${booking.room.images[0].replace(/\\/g, '/')}`} 
                            alt="Room" 
                            style={{ width: "60px", height: "45px", objectFit: "cover", borderRadius: "6px" }} 
                          />
                        ) : (
                          <div style={{ width: "60px", height: "45px", background: "#e2e8f0", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#64748b" }}>No Image</div>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500, color: "#1e293b" }}>{booking.guestName || "N/A"}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500, color: "#1e293b" }}>{booking.hotel?.hotelName || "N/A"}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ color: "#475569" }}>
                          {new Date(booking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ color: "#475569" }}>
                          {new Date(booking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500, color: "#1e293b" }}>₹{booking.totalAmount?.toLocaleString()}</div>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background: statusColors.bg,
                            color: statusColors.text,
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {booking.status.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{...tdStyle, textAlign: "center"}}>
                        <button 
                          title="View Details"
                          style={{
                            background: "transparent", border: "none", cursor: "pointer",
                            color: "#64748b", padding: "4px"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = "#3b82f6"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      No bookings found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION SECTION */}
        {!loading && filteredBookings.length > 0 && (
          <div style={{ 
            display: "flex", justifyContent: "center", alignItems: "center", 
            padding: "16px", borderTop: "1px solid #e2e8f0", gap: "8px" 
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={paginationButtonStyle(currentPage === 1)}
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: "32px", height: "32px", borderRadius: "6px", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  background: currentPage === page ? "#3b82f6" : "transparent",
                  color: currentPage === page ? "#fff" : "#64748b",
                  transition: "all 0.2s"
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={paginationButtonStyle(currentPage === totalPages)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* MODAL OVERLAY */}
      {selectedBooking && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "600px",
            maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            position: "relative"
          }}>
            {/* Modal Header */}
            <div style={{ 
              display: "flex", justifyContent: "space-between", alignItems: "center", 
              padding: "24px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc",
              borderTopLeftRadius: "20px", borderTopRightRadius: "20px"
            }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                  Booking Details
                </h3>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
                  ID: #{selectedBooking.bookingId || selectedBooking._id.substring(0, 8)}
                </span>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: "#e2e8f0", border: "none", width: "32px", height: "32px",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#475569"
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Top Status & Amount Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "24px", borderBottom: "1px dashed #e2e8f0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Total Amount</span>
                  <span style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }}>₹{selectedBooking.totalAmount?.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Booking Status</span>
                  <span style={{
                      background: getStatusColor(selectedBooking.status).bg,
                      color: getStatusColor(selectedBooking.status).text,
                      padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, textTransform: "capitalize"
                    }}>
                    {selectedBooking.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Grid Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                
                {/* Guest Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#3b82f6" }}>
                    <User size={18} />
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>Guest Information</span>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{selectedBooking.guestName || "N/A"}</div>
                    <div style={{ fontSize: "13px", color: "#475569" }}>{selectedBooking.guestEmail || "N/A"}</div>
                    <div style={{ fontSize: "13px", color: "#475569" }}>{selectedBooking.guestPhone || "N/A"}</div>
                  </div>
                </div>

                {/* Hotel Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981" }}>
                    <MapPin size={18} />
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>Property Details</span>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {selectedBooking.room?.images && selectedBooking.room.images[0] && (
                      <img 
                        src={selectedBooking.room.images[0].startsWith("http") ? selectedBooking.room.images[0] : `${URL}/${selectedBooking.room.images[0].replace(/\\/g, '/')}`} 
                        alt="Room" 
                        style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px" }} 
                      />
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{selectedBooking.hotel?.hotelName || "N/A"}</div>
                      <div style={{ fontSize: "13px", color: "#475569" }}>{selectedBooking.room?.roomName || selectedBooking.room?.roomType || "Standard Room"}</div>
                      <div style={{ fontSize: "13px", color: "#475569" }}>{selectedBooking.guests} Guests</div>
                    </div>
                  </div>
                </div>

                {/* Dates Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f59e0b" }}>
                    <Calendar size={18} />
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>Reservation Dates</span>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>Check In:</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{new Date(selectedBooking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>Check Out:</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{new Date(selectedBooking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "4px" }}>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>Duration:</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>{selectedBooking.nights} Nights</span>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8b5cf6" }}>
                    <Receipt size={18} />
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>Payment Breakdown</span>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>Base Amount:</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>₹{selectedBooking.baseAmount?.toLocaleString() || selectedBooking.totalAmount?.toLocaleString()}</span>
                    </div>
                    {selectedBooking.discountAmount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                        <span style={{ fontSize: "13px" }}>Discount:</span>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>-₹{selectedBooking.discountAmount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>Tax:</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>₹{selectedBooking.taxAmount?.toLocaleString() || 0}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "4px" }}>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>Payment Method:</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", textTransform: "uppercase" }}>{selectedBooking.paymentMethod || "CARD"}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const thStyle = {
  padding: "16px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#475569",
  textTransform: "capitalize",
};

const tdStyle = {
  padding: "16px",
  fontSize: "14px",
  color: "#334155",
  verticalAlign: "middle",
};

const paginationButtonStyle = (disabled) => ({
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: disabled ? "#cbd5e1" : "#64748b",
  cursor: disabled ? "not-allowed" : "pointer",
});
