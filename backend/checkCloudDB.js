const mongoose = require("mongoose");
const userModel = require("./model/usermodel");
const adminAccountModel = require("./model/adminAccountModel");
require("dotenv").config();

const DB_URL = process.env.MONGODB_URL; 

const check = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to Cloud DB.");

    // Check users collection for admin
    const adminUsers = await userModel.find({ role: "admin" });
    console.log(`\nTotal 'admin' role in 'users' collection: ${adminUsers.length}`);
    adminUsers.forEach(u => console.log(` - Email: ${u.email} | Role: ${u.role}`));

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
