const Booking = require("../model/booking");
const Room = require("../model/room");
const Hotel = require("../model/hotelModel");
const TempBooking = require("../model/tempBooking");
const Coupon = require("../model/couponModel");


const isRoomBooked = async (roomId, checkIn, checkOut, excludeBookingId = null, userId = null) => {
  const query = {
    room: roomId,
    status: { $in: ["confirmed", "pending"] },
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  const conflict = await Booking.findOne(query);
  if (conflict) return true;

  // Check temp bookings
  const tempQuery = {
    room: roomId,
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  };

  //it is used when user itself refrese screen so temp will show itself room booked 
  if (userId) {
    tempQuery.user = { $ne: userId };
  }

  const tempConflict = await TempBooking.findOne(tempQuery);
  return !!tempConflict;
};


const autoCompleteExpiredBookings = async (roomId) => {
  const now = new Date();
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
    await Room.findByIdAndUpdate(roomId, { bookingStatus: "Available" });
  }
};


exports.createBooking = async (req, res) => {
  try {
    const { hotelId, roomId, guestName, guestEmail, guestPhone, guests, checkIn, checkOut, userId, couponCode } = req.body;

  
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
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

    // Verify room exists and belongs to this hotel
    const room = await Room.findOne({ _id: roomId, hotel: hotelId });
    if (!room) return res.status(404).json({ success: false, message: "Room not found in this hotel" });

    // Auto-complete expired bookings first
    await autoCompleteExpiredBookings(roomId);

    // Check for booking conflicts
    const booked = await isRoomBooked(roomId, checkInDate, checkOutDate, null, userId);
    if (booked) {
      return res.status(409).json({
        success: false,
        message: "This room is already booked for the selected dates. Please choose different dates.",
      });
    }

    // Calculate nights & total
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const pricePerNight = room.finalPrice || room.price;
    let totalAmount = Math.round(pricePerNight * nights);

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({
        couponCode: couponCode.toUpperCase(),
        $or: [
          { hotel: hotelId },
          { adminEmail: hotel.email },
          { hotel: null, adminEmail: null },
          { hotel: { $exists: false }, adminEmail: { $exists: false } }
        ]
      });

      if (!coupon) {
        return res.status(404).json({ success: false, message: "Invalid coupon code for this hotel" });
      }
      if (coupon.status !== "Active") {
        return res.status(400).json({ success: false, message: "Coupon is not active" });
      }
      if (new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({ success: false, message: "Coupon has expired" });
      }
      if (coupon.usedCount >= coupon.maxUsage) {
        return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
      }
      if (totalAmount < coupon.minimumBookingAmount) {
        return res.status(400).json({ success: false, message: `Minimum booking amount of ${coupon.minimumBookingAmount} required for this coupon` });
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = (totalAmount * coupon.discount) / 100;
        if (coupon.maximumDiscount > 0 && discountAmount > coupon.maximumDiscount) {
          discountAmount = coupon.maximumDiscount;
        }
      } else {
        discountAmount = coupon.discount;
      }

      totalAmount = Math.round(totalAmount - discountAmount);
      if (totalAmount < 0) totalAmount = 0;

      // Update coupon usage
      coupon.usedCount += 1;
      await coupon.save();
    }

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

    if (userId) {
      await TempBooking.deleteMany({ room: roomId, user: userId });
    }

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


// CHECK ROOM AVAILABILITY

exports.checkAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: "checkIn and checkOut are required" });
    }

    // Auto-complete expired bookings
    await autoCompleteExpiredBookings(roomId);

    const booked = await isRoomBooked(roomId, checkIn, checkOut, null, req.query.userId);
    return res.status(200).json({ success: true, available: !booked });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET ROOM CALENDAR AVAILABILITY

exports.getRoomCalendarAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Auto-complete expired bookings first
    await autoCompleteExpiredBookings(roomId);
    
    const bookings = await Booking.find({
      room: roomId,
      status: { $in: ["confirmed", "pending"] },
    });
    
    const tempBookings = await TempBooking.find({
      room: roomId,
    });
    
    return res.status(200).json({
      success: true,
      bookings: bookings.map(b => ({
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status,
      })),
      tempBookings: tempBookings.map(t => ({
        checkIn: t.checkIn,
        checkOut: t.checkOut,
        user: t.user
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// ACQUIRE TEMP LOCK
// ─────────────────────────────────────────────
exports.acquireTempLock = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { checkIn, checkOut, userId } = req.body;
    
    if (!checkIn || !checkOut || !userId) {
      return res.status(400).json({ success: false, message: "checkIn, checkOut, and userId are required" });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Auto-complete expired bookings
    await autoCompleteExpiredBookings(roomId);

    // If already locked by this user, just update the dates/time to reset TTL
    const existingLock = await TempBooking.findOne({ room: roomId, user: userId });
    if (existingLock) {
       existingLock.checkIn = checkInDate;
       existingLock.checkOut = checkOutDate;
       existingLock.createdAt = new Date();
       await existingLock.save();
    } else {
       // Check if someone else has booked or locked it
       const booked = await isRoomBooked(roomId, checkInDate, checkOutDate, null, userId);
       if (booked) {
         return res.status(409).json({ success: false, message: "Room is already booked or locked for these dates by another user." });
       }
       
       await TempBooking.create({
         room: roomId,
         user: userId,
         checkIn: checkInDate,
         checkOut: checkOutDate,
       });
    }
    
    return res.status(200).json({ success: true, message: "Temporary lock acquired successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET ROOM STATUS (is currently booked right now?)

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


// GET ALL BOOKINGS FOR A HOTEL

exports.getBookingsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { search, sort } = req.query;
    
    let filter = { hotel: hotelId };
    if (search) {
      filter.$or = [
        { guestName: { $regex: search, $options: "i" } },
        { guestEmail: { $regex: search, $options: "i" } }
      ];
    }

    let sortOption = {};
    if (sort === "a-z") sortOption.guestName = 1;
    else if (sort === "z-a") sortOption.guestName = -1;
    else if (sort === "oldest") sortOption.createdAt = 1;
    else sortOption.createdAt = -1;

    const bookings = await Booking.find(filter)
      .populate("room", "roomName roomType floor roomNumber")
      .sort(sortOption);
    return res.status(200).json({ success: true, result: bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET ALL BOOKINGS (SuperAdmin)

exports.getAllBookings = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let filter = {};
    if (search) {
      filter.$or = [
        { guestName: { $regex: search, $options: "i" } },
        { guestEmail: { $regex: search, $options: "i" } }
      ];
    }

    let sortOption = {};
    if (sort === "a-z") sortOption.guestName = 1;
    else if (sort === "z-a") sortOption.guestName = -1;
    else if (sort === "oldest") sortOption.createdAt = 1;
    else sortOption.createdAt = -1;

    const bookings = await Booking.find(filter)
      .populate("hotel", "hotelName location image")
      .populate("room", "roomName roomType images")
      .sort(sortOption);
    return res.status(200).json({ success: true, result: bookings });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// GET BOOKINGS BY GUEST EMAIL

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

// ─────────────────────────────────────────────
// CHECK-IN BOOKING
// ─────────────────────────────────────────────
exports.checkInBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = "checked_in";
    await booking.save();

    return res.status(200).json({ success: true, message: "Checked in successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
