const mongoose = require("mongoose");
const userModel = require("./model/usermodel");
const superAdminModel = require("./model/superAdminModel");
require("dotenv").config();

// Default fallback URL if process.env.MONGODB_URL is not set
const DB_URL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/hotel-management"; 

const migrate = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to DB for migration...");

    // Find any users with strictly the 'superadmin' role in the standard user table
    const admins = await userModel.find({ role: "superadmin" });
    
    if (admins.length === 0) {
      console.log("No admins found in the users table to migrate.");
      process.exit(0);
    }

    console.log(`Found ${admins.length} admins. Starting migration...`);

    for (let admin of admins) {
      try {
        // Create the isolated Superadmin account
        await superAdminModel.create({
          email: admin.email,
          password: admin.password
        });
        console.log(`[SUCCESS] Migrated ${admin.email} to Superadmin collection.`);

        // Remove the old account from the standard users table to ensure isolation
        await userModel.findByIdAndDelete(admin._id);
        console.log(`[REMOVED] Deleted ${admin.email} from users collection.`);
      } catch (innerErr) {
        // Skip if already exists or fails
        console.error(`[ERROR] Failed to migrate ${admin.email}:`, innerErr.message);
      }
    }

    console.log("Migration finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
