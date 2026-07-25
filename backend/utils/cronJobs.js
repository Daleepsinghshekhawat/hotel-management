const cron = require("node-cron");
const moment = require("moment");
const Booking = require("../model/booking");
const Room = require("../model/room");

// Run every hour at the top of the hour
cron.schedule("0 * * * *", async () => {
  try {
    console.log("[Cron] Running auto-cancel check for un-checked-in bookings...");
    const now = moment();
    
    // Find all active confirmed bookings
    const activeBookings = await Booking.find({ status: "confirmed" });
    
    for (const booking of activeBookings) {
      const checkInDate = moment(booking.checkIn);
      // Set cutoff time to 12:00 PM on the check-in date
      const cutoffTime = checkInDate.clone().set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
      
      // If the current time is past the 12 PM cutoff on the check-in date
      if (now.isAfter(cutoffTime)) {
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
        console.log(`[Cron] Auto-cancelled booking ${booking.bookingId} as check-in time (12 PM) has passed.`);
      }
    }
  } catch (err) {
    console.error("[Cron] Error in auto-cancel cron job:", err);
  }
});
