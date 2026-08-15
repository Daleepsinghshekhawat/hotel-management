const cron = require("node-cron");
const moment = require("moment");
const Booking = require("../model/booking");
const Room = require("../model/room");
const { sendEmail } = require("./helper");

// Run every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("[Cron] Running auto-cancel check for un-checked-in bookings...");
    const now = moment();
    
    // Find all active confirmed bookings
    const activeBookings = await Booking.find({ status: "confirmed" });
    
    for (const booking of activeBookings) {
      const checkInDate = moment(booking.checkIn);
      // Set cutoff time to midnight (end of the check-in day / start of next day)
      // We'll give them until 11:59 PM on their check-in date.
      const cutoffTime = checkInDate.clone().endOf('day');
      
      // If the current time is past the midnight cutoff on the check-in date
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
        
        // Send email to user
        try {
          await sendEmail({
            to: booking.guestEmail,
            subject: "Booking Automatically Cancelled - HotelHub",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #e53e3e; text-align: center;">Booking Cancelled</h2>
                <p>Dear ${booking.guestName},</p>
                <p>We noticed that you did not check in by midnight on your scheduled check-in date (<strong>${moment(booking.checkIn).format("MMMM Do YYYY")}</strong>).</p>
                <p>As per our policy, your booking (ID: <strong>${booking.bookingId}</strong>) has been automatically cancelled.</p>
                <p>If you believe this is an error or need assistance, please contact the hotel immediately.</p>
                <br/>
                <p>Best regards,<br/>The HotelHub Team</p>
              </div>
            `
          });
        } catch (emailErr) {
          console.error(`[Cron] Failed to send auto-cancel email to ${booking.guestEmail}:`, emailErr.message);
        }

        console.log(`[Cron] Auto-cancelled booking ${booking.bookingId} as check-in time (midnight) passed.`);
      }
    }
  } catch (err) {
    console.error("[Cron] Error in auto-cancel cron job:", err);
  }
});
