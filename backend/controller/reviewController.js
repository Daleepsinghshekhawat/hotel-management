const Review = require("../model/reviewModel");
const Hotel = require("../model/hotelModel");

exports.addReview = async (req, res) => {
  try {
    const { hotelId, userId, rating, reviewText } = req.body;
    if (!hotelId || !userId || !rating || !reviewText) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ success: false, message: "Hotel not found" });

    const review = await Review.create({
      hotel: hotelId,
      user: userId,
      rating,
      reviewText,
    });

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
    const { search } = req.query;
    let reviews = await Review.find()
      .populate("hotel", "hotelName")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    if (search) {
      const searchRegex = new RegExp(search, "i");
      reviews = reviews.filter((review) => {
        return (
          searchRegex.test(review.reviewText) ||
          (review.user && searchRegex.test(review.user.name)) ||
          (review.user && searchRegex.test(review.user.email))
        );
      });
    }

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
