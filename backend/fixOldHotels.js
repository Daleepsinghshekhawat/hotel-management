require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Hotel = require("./model/hotelModel");
const Room = require("./model/room");

const mapFile = path.join(__dirname, "uploaded_mapping.json");

const unsplashImages = [
  "https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?w=800",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  "https://images.unsplash.com/photo-1551882547-ff40c0d5b9af?w=800",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800",
  "https://images.unsplash.com/photo-1541971875076-8f970d573be6?w=800",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800"
];

const runFixer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected");

    const hotels = await Hotel.find({});
    const rooms = await Room.find({});
    const hotelIdsWithRooms = new Set(rooms.map(r => r.hotel.toString()));
    
    const hotelsWithNoRooms = hotels.filter(h => !hotelIdsWithRooms.has(h._id.toString()));
    console.log(`Found ${hotelsWithNoRooms.length} hotels with no rooms.`);

    let imageIndex = 0;

    // We also need room images for the new rooms we're creating
    let uploadedMap = {};
    if (fs.existsSync(mapFile)) {
      uploadedMap = JSON.parse(fs.readFileSync(mapFile, "utf-8"));
    }
    const roomUrls = [];
    for (const [filename, url] of Object.entries(uploadedMap)) {
      if (!filename.toLowerCase().includes("hotel") && !filename.toLowerCase().includes("palace")) {
        roomUrls.push({ url, filename });
      }
    }

    for (const hotel of hotelsWithNoRooms) {
      console.log(`Fixing hotel: ${hotel.hotelName}`);

      // 1. Replace image with Unsplash
      hotel.image = unsplashImages[imageIndex % unsplashImages.length];
      await hotel.save();
      imageIndex++;

      // 2. Add rooms with varied prices
      const priceVariation = Math.floor(Math.random() * 1000) - 500; // Between -500 and +500

      const roomTemplates = [
        { type: "Single", beds: 1, bedType: "Single", price: 1500 + priceVariation, maxGuests: 1 },
        { type: "Double", beds: 1, bedType: "Double", price: 2500 + priceVariation, maxGuests: 2 },
        { type: "Queen", beds: 1, bedType: "Queen", price: 3500 + priceVariation, maxGuests: 2 },
        { type: "King", beds: 1, bedType: "King", price: 4500 + priceVariation, maxGuests: 2 },
        { type: "Twin", beds: 2, bedType: "Twin", price: 3000 + priceVariation, maxGuests: 2 }
      ];

      for (const tpl of roomTemplates) {
        // Shuffle roomUrls for variety
        const shuffled = [...roomUrls].sort(() => 0.5 - Math.random());
        
        // Take matching or random
        const matchingImgs = shuffled
          .filter(r => r.filename.toLowerCase().includes(tpl.bedType.toLowerCase()) || r.filename.toLowerCase().includes(tpl.type.toLowerCase()) || r.filename.toLowerCase().includes("room"))
          .map(r => r.url);
        
        let finalImages = matchingImgs.slice(0, 3);
        if (finalImages.length < 3) {
          const remaining = 3 - finalImages.length;
          const otherUrls = shuffled.map(r => r.url).filter(u => !finalImages.includes(u)).slice(0, remaining);
          finalImages = [...finalImages, ...otherUrls];
        }

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
          finalPrice: tpl.price - (tpl.price * 0.1),
          discount: 10,
          totalRooms: 5,
          availableRooms: 5,
          images: finalImages,
          wifi: true,
          ac: true,
          smartTV: true,
          roomView: "City",
          attachedBathroom: true,
          hotWater: true,
          status: true
        });
      }
      console.log(`Created 5 rooms for ${hotel.hotelName} with varied prices.`);
    }

    console.log("Fix complete!");
    process.exit(0);

  } catch (error) {
    console.error("Error fixing hotels:", error);
    process.exit(1);
  }
};

runFixer();
