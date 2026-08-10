const PDFDocument = require("pdfkit");
const Hotel = require("../model/hotelModel");
const Room = require("../model/room");
const Coupon = require("../model/couponModel");
const Booking = require("../model/booking");
require("../model/citymodel");
require("../model/districtmodel");
require("../model/statemodel");

// Helper to format hotel location
const formatLocation = (loc) => {
  if (typeof loc === "string") return loc;
  if (!loc) return "N/A";
  const city = loc.cityname || "";
  const dist = loc.district && loc.district.districtname ? loc.district.districtname : "";
  const state = loc.state && loc.state.Statename ? loc.state.Statename : "";
  return [city, dist, state].filter(Boolean).join(", ") || "N/A";
};

exports.generateHotelPdf = async (req, res) => {
  try {
    const { id } = req.params;
    let hotel = await Hotel.findById(id).populate("location");
    
    if (!hotel) {
      hotel = await Hotel.findOne({ requestId: id }).populate("location");
    }
    
    if (!hotel) {
      const HotelRequest = require("../model/hotelRequestModel");
      hotel = await HotelRequest.findById(id).populate("location");
    }

    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="hotel-${id}.pdf"`,
    });

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor("#1e293b").text("Hotel Details", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#64748b").text(`${hotel.hotelType || 'Hotel'} | Status: ${hotel.status || 'Active'}`, { align: "center" });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(1);

    // General Info
    doc.fontSize(18).fillColor("#0f172a").text("General Information");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#334155");
    doc.text(`Name: ${hotel.hotelName}`);
    doc.text(`Location: ${formatLocation(hotel.location)}`);
    doc.text(`Owner: ${hotel.ownerName || 'N/A'}`);
    doc.text(`Email: ${hotel.email || 'N/A'}`);
    doc.text(`Registration ID: ${hotel.registrationId || 'N/A'}`);
    doc.moveDown(1.5);

    // Description
    doc.fontSize(18).fillColor("#0f172a").text("Description");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#475569").text(hotel.description || "No description available.", { align: "justify" });
    doc.moveDown(1.5);

    // Footer
    doc.fontSize(10).fillColor("#94a3b8").text(`Generated on ${new Date().toLocaleDateString()}`, 50, 700, { align: "center", lineBreak: false });

    doc.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ success: false, message: "Error generating PDF" });
  }
};

exports.generateRoomPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).populate("hotel");
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="room-${id}.pdf"`,
    });

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(24).fillColor("#1e293b").text("Room Details", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#64748b").text(`Room No: ${room.roomNumber} | Type: ${room.roomType || 'Standard'}`, { align: "center" });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(1);

    doc.fontSize(18).fillColor("#0f172a").text("Room Information");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#334155");
    doc.text(`Room Name: ${room.roomName}`);
    doc.text(`Price: Rs. ${room.price || 0} / night`);
    doc.text(`Max Guests: ${room.maxGuests || 1}`);
    doc.text(`Bed Type: ${room.bedType || 'N/A'}`);
    doc.text(`Room Size: ${room.roomSize || 'N/A'} sqft`);
    doc.text(`Booking Status: ${room.bookingStatus || 'Available'}`);
    doc.moveDown(1.5);

    doc.fontSize(18).fillColor("#0f172a").text("Description");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#475569").text(room.description || "No description available.", { align: "justify" });
    doc.moveDown(1.5);

    doc.fontSize(18).fillColor("#0f172a").text("Amenities");
    doc.moveDown(0.5);
    const amenitiesList = [];
    if (room.wifi) amenitiesList.push("WiFi");
    if (room.ac) amenitiesList.push("Air Conditioning");
    if (room.smartTV) amenitiesList.push("Smart TV");
    if (room.hotWater) amenitiesList.push("Hot Water");
    if (room.attachedBathroom) amenitiesList.push("Attached Bathroom");
    if (room.coffeeMachine) amenitiesList.push("Coffee Machine");
    if (room.roomService) amenitiesList.push("Room Service");
    if (room.gym) amenitiesList.push("Gym");
    if (room.swimmingPool) amenitiesList.push("Swimming Pool");
    if (room.parking) amenitiesList.push("Parking");
    
    if (amenitiesList.length > 0) {
      doc.fontSize(12).fillColor("#475569").text(amenitiesList.join(", "));
    } else {
      doc.fontSize(12).fillColor("#475569").text("No standard amenities specified.");
    }

    doc.fontSize(10).fillColor("#94a3b8").text(`Generated on ${new Date().toLocaleDateString()}`, 50, 700, { align: "center", lineBreak: false });
    doc.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ success: false, message: "Error generating PDF" });
  }
};

exports.generateCouponsPdf = async (req, res) => {
  try {
    const { adminEmail } = req.query;
    let query = {};
    if (adminEmail) {
      query.adminEmail = adminEmail;
    }
    const coupons = await Coupon.find(query);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="coupons-list.pdf"`,
    });

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(24).fillColor("#1e293b").text("Coupons & Offers Receipt Pdf", { align: "center" });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(1);

    if (coupons.length === 0) {
      doc.fontSize(14).fillColor("#64748b").text("No coupons available.", { align: "center" });
    } else {
      coupons.forEach((coupon, index) => {
        doc.fontSize(14).fillColor("#0f172a").text(`${index + 1}. Code: ${coupon.couponCode}`);
        doc.fontSize(12).fillColor("#475569");
        const discountText = coupon.discountType === "percentage" ? `${coupon.discount}% OFF` : `Rs. ${coupon.discount} OFF`;
        doc.text(`Discount: ${discountText}`);
        doc.text(`Minimum Booking: Rs. ${coupon.minimumBookingAmount}`);
        doc.text(`Status: ${coupon.status}`);
        doc.text(`Expiry Date: ${new Date(coupon.expiryDate).toLocaleDateString()}`);
        doc.moveDown(1);
      });
    }

    doc.fontSize(10).fillColor("#94a3b8").text(`Generated on ${new Date().toLocaleDateString()}`, 50, 700, { align: "center", lineBreak: false });
    doc.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ success: false, message: "Error generating PDF" });
  }
};

exports.generateBookingReceiptPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("hotel").populate("room");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${booking.bookingId}.pdf"`,
    });

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(24).fillColor("#1e293b").text("Booking Receipt", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#64748b").text(`Booking ID: ${booking.bookingId}`, { align: "center" });
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(1);

    doc.fontSize(16).fillColor("#0f172a").text("Guest Details");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#334155");
    doc.text(`Name: ${booking.guestName}`);
    doc.text(`Email: ${booking.guestEmail}`);
    doc.text(`Phone: ${booking.guestPhone}`);
    doc.moveDown(1);

    doc.fontSize(16).fillColor("#0f172a").text("Reservation Details");
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#334155");
    doc.text(`Hotel: ${booking.hotel?.hotelName || 'N/A'}`);
    doc.text(`Room: ${booking.room?.roomName || 'N/A'}`);
    doc.text(`Guests: ${booking.guests}`);
    doc.text(`Check-In: ${new Date(booking.checkIn).toLocaleDateString()}`);
    doc.text(`Check-Out: ${new Date(booking.checkOut).toLocaleDateString()}`);
    doc.text(`Nights: ${booking.nights}`);
    doc.text(`Status: ${booking.status}`);
    doc.moveDown(1);

    // Total Amount Box
    doc.rect(50, doc.y, 500, 60).fillAndStroke("#e0f2fe", "#0284c7");
    doc.fillColor("#0369a1").fontSize(16).text("Total Amount Paid", 70, doc.y - 40);
    // Align right to the box
    doc.fillColor("#0284c7").fontSize(20).text(`Rs. ${booking.totalAmount}`, 50, doc.y - 20, { align: 'right', width: 480 });
    
    doc.fontSize(10).fillColor("#94a3b8").text(`Thank you for booking with us! \nGenerated on ${new Date().toLocaleDateString()}`, 50, 700, { align: "center", lineBreak: false });

    doc.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ success: false, message: "Error generating PDF" });
  }
};

exports.generateBookingsListPdf = async (req, res) => {
  try {
    const { adminEmail, type } = req.query;
    
    if (!adminEmail) return res.status(400).json({ success: false, message: "adminEmail is required" });

    const hotels = await Hotel.find({ email: adminEmail });
    const hotelIds = hotels.map(h => h._id);

    let query = { hotel: { $in: hotelIds } };
    if (type === 'active') {
      query.status = { $in: ['pending', 'confirmed', 'checked_in'] };
    } else if (type === 'history') {
      query.status = { $in: ['completed', 'cancelled'] };
    }

    const bookings = await Booking.find(query).populate('hotel').populate('room').sort({ createdAt: -1 });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bookings-list.pdf"`,
    });

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    const title = type === 'active' ? "Active Bookings Report" : type === 'history' ? "Booking History Report" : "All Bookings Report";
    doc.fontSize(22).fillColor("#1e293b").text(title, { align: "center" });
    doc.moveDown(1);
    doc.moveTo(40, doc.y).lineTo(570, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(1);

    if (bookings.length === 0) {
      doc.fontSize(14).fillColor("#64748b").text("No bookings found.", { align: "center" });
    } else {
      bookings.forEach((b, index) => {
        doc.fontSize(14).fillColor("#0f172a").text(`Booking ID: ${b.bookingId || b._id}`);
        doc.fontSize(11).fillColor("#475569");
        doc.text(`Guest: ${b.guestName} (${b.guestEmail})`);
        doc.text(`Hotel: ${b.hotel?.hotelName || 'N/A'}`);
        doc.text(`Room: ${b.room?.roomName || 'N/A'}`);
        doc.text(`Dates: ${new Date(b.checkIn).toLocaleDateString()} to ${new Date(b.checkOut).toLocaleDateString()}`);
        doc.text(`Status: ${(b.status || 'confirmed').toUpperCase()}`);
        doc.fillColor("#0284c7").text(`Amount: Rs. ${b.totalAmount || 0}`);
        doc.moveDown(1);
      });
    }

    doc.fontSize(10).fillColor("#94a3b8").text(`Generated on ${new Date().toLocaleDateString()}`, 40, 750, { align: "center", lineBreak: false });
    doc.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).json({ success: false, message: "Error generating PDF" });
  }
};
