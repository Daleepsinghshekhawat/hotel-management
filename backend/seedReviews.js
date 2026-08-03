require("dotenv").config();
const mongoose = require("mongoose");

const Booking = require("./model/booking");
const Review = require("./model/reviewModel");
const User = require("./model/usermodel");
const Hotel = require("./model/hotelModel");

const reviewTexts = [
  "Absolutely loved my stay! The room was clean, the staff was friendly, and the amenities were top-notch.",
  "Great experience overall. The location is perfect, and the bed was incredibly comfortable. Highly recommend!",
  "A wonderful hotel with beautiful views. The check-in process was smooth, and we had everything we needed.",
  "Very good value for the price. The room was spacious and well-maintained. Will definitely come back.",
  "Exceptional service! The staff went above and beyond to make sure our stay was memorable. 5 stars!"
];

const seedReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected");

    const users = await User.find({});
    if (users.length === 0) {
      console.log("No users found to author reviews.");
      process.exit(1);
    }

    const bookings = await Booking.find({}).populate("hotel");
    console.log(`Found ${bookings.length} bookings.`);

    let reviewsCreated = 0;

    if (bookings.length > 0) {
        // If there are bookings, generate reviews from them
        for (const booking of bookings) {
            // Find a user matching the guestEmail, or just use a random user
            let user = users.find(u => u.email === booking.guestEmail);
            if (!user) {
                user = users[Math.floor(Math.random() * users.length)];
            }

            const existingReview = await Review.findOne({ hotel: booking.hotel._id, user: user._id });
            if (!existingReview) {
                await Review.create({
                    hotel: booking.hotel._id,
                    user: user._id,
                    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                    reviewText: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
                    status: "Approved"
                });
                reviewsCreated++;
            }
        }
    } else {
        // If no bookings exist, just generate mock reviews for the newly seeded hotels
        console.log("No past bookings found. Generating mock reviews for seeded hotels directly.");
        const Hotel = require("./model/hotelModel");
        const hotels = await Hotel.find({});
        for (const hotel of hotels) {
            // Create 2-3 reviews per hotel
            const numReviews = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < numReviews; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                
                const existingReview = await Review.findOne({ hotel: hotel._id, user: user._id });
                if (!existingReview) {
                    await Review.create({
                        hotel: hotel._id,
                        user: user._id,
                        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                        reviewText: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
                        status: "Approved"
                    });
                    reviewsCreated++;
                }
            }
        }
    }

    console.log(`Successfully created ${reviewsCreated} reviews.`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

seedReviews();
