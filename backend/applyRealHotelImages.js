require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

const Hotel = require("./model/hotelModel");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generatedImagesDir = "C:\\Users\\ds940\\.gemini\\antigravity\\brain\\07d5c90a-762d-4bc2-b063-231effc930a0";

const guaranteedHotelImages = [
  "https://res.cloudinary.com/jkh5lqnq/image/upload/v1785777778/hotel_seeder/lvb7akos5fayerbs5qyj.jpg", // city palace
  "https://res.cloudinary.com/jkh5lqnq/image/upload/v1785777780/hotel_seeder/fr1qutmfzgpjo5atsvmu.jpg", // hotel1
  "https://res.cloudinary.com/jkh5lqnq/image/upload/v1785777784/hotel_seeder/g59i0rkyoajdnw1k8zid.jpg", // hotel2
  "https://res.cloudinary.com/jkh5lqnq/image/upload/v1785777786/hotel_seeder/sezywohdhmiz0mbksirz.jpg", // hotel3
  "https://res.cloudinary.com/jkh5lqnq/image/upload/v1785777788/hotel_seeder/eiblxdkubzau8bublmbw.jpg", // hotel4
  "https://res.cloudinary.com/jkh5lqnq/image/upload/v1785777789/hotel_seeder/ebhoqg5i8siu6okc4acn.jpg", // hotel5
  "https://res.cloudinary.com/jkh5lqnq/image/upload/v1785777790/hotel_seeder/kjw6rornxgscr7cxiooo.jpg", // hotel6
  "https://res.cloudinary.com/jkh5lqnq/image/upload/v1785777792/hotel_seeder/qjuyinbno2f2237xg7dy.jpg", // hotel7
  "https://res.cloudinary.com/jkh5lqnq/image/upload/v1785777793/hotel_seeder/wn8rslcoseklwpdka8px.jpg", // hotel8
  "https://res.cloudinary.com/jkh5lqnq/image/upload/v1785777794/hotel_seeder/com3ktakext6xgxikipe.jpg", // hotel9
];

const uploadFile = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder: "hotel_generated_palace" });
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload ${filePath}:`, error);
    return null;
  }
};

const runFixer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected");

    console.log("Uploading generated AI palace images to Cloudinary...");
    const files = fs.readdirSync(generatedImagesDir).filter(f => f.startsWith("hotel_palace_") && f.endsWith(".jpg"));
    
    for (const file of files) {
      const fullPath = path.join(generatedImagesDir, file);
      const url = await uploadFile(fullPath);
      if (url) {
        guaranteedHotelImages.push(url);
      }
    }

    console.log(`Total unique high-quality palace hotel images available: ${guaranteedHotelImages.length}`);

    const hotels = await Hotel.find({});
    console.log(`Found ${hotels.length} hotels. Reassigning to the verified images.`);

    const shuffled = guaranteedHotelImages.sort(() => 0.5 - Math.random());

    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      hotel.image = shuffled[i % shuffled.length];
      await hotel.save();
      console.log(`Updated ${hotel.hotelName}`);
    }

    console.log("All hotel images fixed!");
    process.exit(0);

  } catch (error) {
    console.error("Error fixing hotels:", error);
    process.exit(1);
  }
};

runFixer();
