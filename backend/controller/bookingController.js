const Booking = require("../model/booking");
const Room = require("../model/room");
const Hotel = require("../model/hotelModel");

// ─────────────────────────────────────────────
// Helper: Check if room is booked for given dates
// ─────────────────────────────────────────────
const isRoomBooked = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const query = {
    room: roomId,
    status: { $in: ["confirmed", "pending"] },
    // Overlap check: existing booking overlaps with requested dates
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  const conflict = await Booking.findOne(query);
  return !!conflict;
};

// ─────────────────────────────────────────────
// Auto-complete bookings whose checkout has passed
// ─────────────────────────────────────────────
const autoCompleteExpiredBookings = async (roomId) => {
  const now = new Date();
  // Find confirmed bookings for this room that are past checkout
  const expired = await Booking.find({
    room: roomId,
    status: "confirmed",
    checkOut: { $lte: now },
  });

  if (expired.length > 0) {
    await Booking.updateMany(
      { room: roomId, status: "confirmed", checkOut: { $lte: now } },
      { status: "completed" }
    );
    // Set room back to Available
    await Room.findByIdAndUpdate(roomId, { bookingStatus: "Available" });
  }
};

// ─────────────────────────────────────────────
// CREATE BOOKING
// ─────────────────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
    const { hotelId, roomId, guestName, guestEmail, guestPhone, guests, checkIn, checkOut } = req.body;

    // Validate required fields
    if (!hotelId || !roomId || !guestName || !guestEmail || !guestPhone || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ success: false, message: "Check-out must be after check-in" });
    }

    if (checkInDate < new Date(new Date().setHours(0,0,0,0))) {
      return res.status(400).json({ success: false, message: "Check-in date cannot be in the past" });
    }

    // Verify hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

    // Verify room exists and belongs to this hotel
    const room = await Room.findOne({ _id: roomId, hotel: hotelId });
    if (!room) return res.status(404).json({ success: false, message: "Room not found in this hotel" });

    // Auto-complete expired bookings first
    await autoCompleteExpiredBookings(roomId);

    // Check for booking conflicts
    const booked = await isRoomBooked(roomId, checkInDate, checkOutDate);
    if (booked) {
      return res.status(409).json({
        success: false,
        message: "This room is already booked for the selected dates. Please choose different dates.",
      });
    }

    // Calculate nights & total
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const pricePerNight = room.finalPrice || room.price;
    const totalAmount = Math.round(pricePerNight * nights);

    // Create booking
    const booking = await Booking.create({
      hotel: hotelId,
      room: roomId,
      guestName,
      guestEmail: guestEmail.toLowerCase(),
      guestPhone,
      guests: guests || 1,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      pricePerNight,
      totalAmount,
      status: "confirmed",
    });

    // Mark room as Booked
    await Room.findByIdAndUpdate(roomId, { bookingStatus: "Booked" });

    const populated = await Booking.findById(booking._id)
      .populate("hotel", "hotelName email location")
      .populate("room", "roomName roomType floor");

    return res.status(201).json({
      success: true,
      message: "Booking confirmed successfully!",
      result: populated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// CHECK ROOM AVAILABILITY
// ─────────────────────────────────────────────
exports.checkAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: "checkIn and checkOut are required" });
    }

    // Auto-complete expired bookings
    await autoCompleteExpiredBookings(roomId);

    const booked = await isRoomBooked(roomId, checkIn, checkOut);
    return res.status(200).json({ success: true, available: !booked });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET ROOM STATUS (is currently booked right now?)
// ─────────────────────────────────────────────
exports.getRoomBookingStatus = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Auto-complete expired bookings
    await autoCompleteExpiredBookings(roomId);

    const now = new Date();
    const activeBooking = await Booking.findOne({
      room: roomId,
      status: { $in: ["confirmed", "pending"] },
      checkIn: { $lte: now },
      checkOut: { $gt: now },
    });

    // Also check future bookings
    const futureBooking = await Booking.findOne({
      room: roomId,
      status: { $in: ["confirmed", "pending"] },
      checkIn: { $gt: now },
    }).sort({ checkIn: 1 });

    return res.status(200).json({
      success: true,
      isCurrentlyBooked: !!activeBooking,
      hasFutureBooking: !!futureBooking,
      activeBooking: activeBooking ? {
        checkIn: activeBooking.checkIn,
        checkOut: activeBooking.checkOut,
      } : null,
      nextAvailableFrom: activeBooking ? activeBooking.checkOut : null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET ALL BOOKINGS FOR A HOTEL
// ─────────────────────────────────────────────
exports.getBookingsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const bookings = await Booking.find({ hotel: hotelId })
      .populate("room", "roomName roomType floor roomNumber")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, result: bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET ALL BOOKINGS (SuperAdmin)
// ─────────────────────────────────────────────
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("hotel", "hotelName location")
      .populate("room", "roomName roomType")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, result: bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET BOOKINGS BY GUEST EMAIL
// ─────────────────────────────────────────────
exports.getBookingsByGuest = async (req, res) => {
  try {
    const { email } = req.params;
    const bookings = await Booking.find({ guestEmail: email.toLowerCase() })
      .populate("hotel", "hotelName location image")
      .populate("room", "roomName roomType images price")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, result: bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// CANCEL BOOKING
// ─────────────────────────────────────────────
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "cancelled";
    await booking.save();

    // Check if room has any other active bookings
    const otherActive = await Booking.findOne({
      room: booking.room,
      status: { $in: ["confirmed", "pending"] },
      _id: { $ne: booking._id },
    });

    if (!otherActive) {
      await Room.findByIdAndUpdate(booking.room, { bookingStatus: "Available" });
    }

    return res.status(200).json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// CHECKOUT BOOKING (UNBOOK)
// ─────────────────────────────────────────────
exports.checkoutBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "completed";
    await booking.save();

    // Check if room has any other active bookings
    const otherActive = await Booking.findOne({
      room: booking.room,
      status: { $in: ["confirmed", "pending"] },
      _id: { $ne: booking._id },
    });

    if (!otherActive) {
      await Room.findByIdAndUpdate(booking.room, { bookingStatus: "Available" });
    }

    return res.status(200).json({ success: true, message: "Checked out successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
