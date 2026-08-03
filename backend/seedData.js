require("dotenv").config();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

const Hotel = require("./model/hotelModel");
const Room = require("./model/room");
const City = require("./model/citymodel");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const assetsDir = path.join(__dirname, "../frontend/myapp/src/assets");
const mapFile = path.join(__dirname, "uploaded_mapping.json");

let uploadedMap = {};
if (fs.existsSync(mapFile)) {
  uploadedMap = JSON.parse(fs.readFileSync(mapFile, "utf-8"));
}

const saveMap = () => {
  fs.writeFileSync(mapFile, JSON.stringify(uploadedMap, null, 2));
};

const uploadFile = async (filePath, filename) => {
  if (uploadedMap[filename]) {
    return uploadedMap[filename];
  }
  console.log(`Uploading ${filename}...`);
  try {
    const result = await cloudinary.uploader.upload(filePath, { folder: "hotel_seeder" });
    uploadedMap[filename] = result.secure_url;
    saveMap();
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload ${filename}:`, error);
    return null;
  }
};

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected");

    if (!fs.existsSync(assetsDir)) {
        console.log("Assets directory not found:", assetsDir);
        process.exit(1);
    }

    const files = fs.readdirSync(assetsDir);
    const hotelImages = [];
    const roomImages = [];

    for (const file of files) {
      if (file.toLowerCase().includes("hotel") || file.toLowerCase().includes("palace")) {
        hotelImages.push(file);
      } else {
        roomImages.push(file);
      }
    }

    console.log(`Found ${hotelImages.length} hotel images and ${roomImages.length} room images.`);

    // Get a city
    const city = await City.findOne({});
    if (!city) throw new Error("No city found in DB to link hotels to.");

    // Create Hotels
    const createdHotels = [];
    for (let i = 0; i < hotelImages.length; i++) {
      const filename = hotelImages[i];
      const url = await uploadFile(path.join(assetsDir, filename), filename);
      if (!url) continue;

      // Check if hotel exists with this image
      let hotel = await Hotel.findOne({ image: url });
      if (!hotel) {
        console.log(`Creating hotel for ${filename}...`);
        hotel = await Hotel.create({
          hotelName: `Grand ${filename.replace(/\.[^/.]+$/, "").toUpperCase()} Resort`,
          ownerName: "Admin User",
          email: "admin@example.com",
          location: city._id,
          description: "A beautiful and luxurious resort offering the best amenities and comfort for your stay. Experience world-class hospitality.",
          image: url,
          registrationId: `REG-${Date.now()}-${i}`,
          submittedBy: "admin@example.com",
          hotelType: "Resort",
          amenities: ["swimmingPool", "gym", "spa", "restaurant", "wifi", "parking"],
          status: "active"
        });
      } else {
        console.log(`Hotel already exists for image: ${url}`);
      }
      createdHotels.push(hotel);
    }

    // Process Room Images
    const roomUrls = [];
    for (const filename of roomImages) {
      const url = await uploadFile(path.join(assetsDir, filename), filename);
      if (url) roomUrls.push({ url, filename });
    }

    // Define room templates
    const roomTemplates = [
      { type: "Single", beds: 1, bedType: "Single", price: 1500, maxGuests: 1 },
      { type: "Double", beds: 1, bedType: "Double", price: 2500, maxGuests: 2 },
      { type: "Queen", beds: 1, bedType: "Queen", price: 3500, maxGuests: 2 },
      { type: "King", beds: 1, bedType: "King", price: 4500, maxGuests: 2 },
      { type: "Twin", beds: 2, bedType: "Twin", price: 3000, maxGuests: 2 }
    ];

    // For each hotel, assign some rooms using the room URLs
    for (const hotel of createdHotels) {
      console.log(`Adding rooms to ${hotel.hotelName}...`);
      
      for (const tpl of roomTemplates) {
        // Find matching images for this template if possible
        const matchingImgs = roomUrls
          .filter(r => r.filename.toLowerCase().includes(tpl.bedType.toLowerCase()) || r.filename.toLowerCase().includes(tpl.type.toLowerCase()) || r.filename.toLowerCase().includes("room"))
          .map(r => r.url);
        
        const imagesToUse = matchingImgs.length > 0 ? matchingImgs.slice(0, 3) : roomUrls.slice(0, 3).map(r => r.url);

        // Check if this room type already exists for this hotel
        const existingRoom = await Room.findOne({ hotel: hotel._id, roomType: tpl.type });
        if (!existingRoom && imagesToUse.length > 0) {
          await Room.create({
            hotel: hotel._id,
            roomName: `Premium ${tpl.type} Room`,
            roomNumber: `${hotel.hotelName.substring(0,2).toUpperCase()}-${Math.floor(Math.random()*900)+100}`,
            floor: Math.floor(Math.random() * 5) + 1,
            roomType: tpl.type,
            description: `A spacious and comfortable ${tpl.type} room designed to provide you with the utmost relaxation during your stay.`,
            roomSize: Math.floor(Math.random() * 200) + 200,
            adults: tpl.maxGuests,
            maxGuests: tpl.maxGuests,
            beds: tpl.beds,
            bedType: tpl.bedType,
            price: tpl.price,
            finalPrice: tpl.price - (tpl.price * 0.1), // 10% discount
            discount: 10,
            totalRooms: 5,
            availableRooms: 5,
            images: imagesToUse,
            wifi: true,
            ac: true,
            smartTV: true,
            roomView: "City",
            attachedBathroom: true,
            hotWater: true,
            status: true
          });
          console.log(`Created ${tpl.type} room for ${hotel.hotelName}`);
        } else {
            console.log(`${tpl.type} room already exists or no images for ${hotel.hotelName}`);
        }
      }
    }

    console.log("Seeding complete!");
    process.exit(0);

  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
};

runSeeder();
