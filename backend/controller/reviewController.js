const Review = require("../model/reviewModel");
const Hotel = require("../model/hotelModel");
const Booking = require("../model/booking");

exports.addReview = async (req, res) => {
  try {
    const { hotelId, userId, rating, reviewText, bookingId } = req.body;
    if (!hotelId || !userId || !rating || !reviewText || !bookingId) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    
    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "You can only review a completed booking" });
    }

    if (booking.isReviewed) {
      return res.status(400).json({ success: false, message: "You have already reviewed this booking" });
    }

    const review = await Review.create({
      hotel: hotelId,
      booking: bookingId,
      user: userId,
      rating,
      reviewText,
    });

    booking.isReviewed = true;
    await booking.save();

    return res.status(201).json({ success: true, message: "Review added successfully", result: review });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getReviewsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const reviews = await Review.find({ hotel: hotelId }).populate("user", "name email");
    return res.status(200).json({ success: true, result: reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const { search, sort } = req.query;
    
    let filter = {};
    if (search) {
      filter.$or = [
        { reviewText: { $regex: search, $options: "i" } }
      ];
    }

    let sortOption = {};
    if (sort === "oldest") sortOption.createdAt = 1;
    else sortOption.createdAt = -1;

    let reviews = await Review.find(filter)
      .populate("hotel", "hotelName")
      .populate("user", "name email")
      .sort(sortOption);

    return res.status(200).json({ success: true, result: reviews });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    return res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
