const mongoose = require("mongoose");
require("dotenv").config();
const Hotel = require("./model/hotelModel");
const HotelRequest = require("./model/hotelRequestModel");

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB for migration");

    const amenities = ["WiFi", "Parking", "Restaurant", "Swimming Pool", "AC", "Room Service"];
    const hotelType = "Hotel";

    // Update Hotels
    const hotelResult = await Hotel.updateMany(
      {},
      { $set: { hotelType, amenities } }
    );
    console.log(`Updated ${hotelResult.modifiedCount} hotels.`);

    // Update Hotel Requests
    const reqResult = await HotelRequest.updateMany(
      {},
      { $set: { hotelType, amenities } }
    );
    console.log(`Updated ${reqResult.modifiedCount} hotel requests.`);

    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
