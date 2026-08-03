require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Room = require("./model/room");

const mapFile = path.join(__dirname, "uploaded_mapping.json");

const runRandomizer = async () => {
  try {
    if (!fs.existsSync(mapFile)) {
      console.log("No uploaded_mapping.json found.");
      process.exit(1);
    }
    const uploadedMap = JSON.parse(fs.readFileSync(mapFile, "utf-8"));
    
    // Extract room image URLs
    const roomUrls = [];
    for (const [filename, url] of Object.entries(uploadedMap)) {
      if (!filename.toLowerCase().includes("hotel") && !filename.toLowerCase().includes("palace")) {
        roomUrls.push({ url, filename });
      }
    }

    if (roomUrls.length === 0) {
      console.log("No room URLs found in mapping.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected");

    const rooms = await Room.find({});
    console.log(`Found ${rooms.length} rooms to randomize images for.`);

    for (const room of rooms) {
      // Shuffle roomUrls
      const shuffled = roomUrls.sort(() => 0.5 - Math.random());
      
      // Try to find images matching the room type/bed type first, but if not enough, just use random ones
      const matchingImgs = shuffled
          .filter(r => r.filename.toLowerCase().includes(room.bedType?.toLowerCase() || "") || 
                       r.filename.toLowerCase().includes(room.roomType?.toLowerCase() || "") || 
                       r.filename.toLowerCase().includes("room"))
          .map(r => r.url);
          
      // Take up to 3 matching, if we need more, take from the shuffled list
      let finalImages = matchingImgs.slice(0, 3);
      if (finalImages.length < 3) {
          const remaining = 3 - finalImages.length;
          const otherUrls = shuffled.map(r => r.url).filter(u => !finalImages.includes(u)).slice(0, remaining);
          finalImages = [...finalImages, ...otherUrls];
      }

      room.images = finalImages;
      await room.save();
    }

    console.log("Randomization complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

runRandomizer();
