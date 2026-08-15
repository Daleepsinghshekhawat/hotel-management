const mongoose = require("mongoose");
const userModel = require("./model/usermodel");
const adminAccountModel = require("./model/adminAccountModel");
require("dotenv").config();

const DB_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017/hotel-management"; 

const check = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to DB.");

    // Check users collection
    const users = await userModel.find({});
    console.log(`\nTotal users in 'users' collection: ${users.length}`);
    users.forEach(u => console.log(` - Email: ${u.email} | Role: ${u.role}`));

    // Check adminAccounts collection
    const adminAccounts = await adminAccountModel.find({});
    console.log(`\nTotal admins in 'adminaccounts' collection: ${adminAccounts.length}`);
    adminAccounts.forEach(a => console.log(` - Email: ${a.email} | Role: ${a.role} | Status: ${a.status}`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
