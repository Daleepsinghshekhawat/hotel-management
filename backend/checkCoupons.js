const mongoose = require("mongoose");
const Coupon = require("./model/couponModel");
require("dotenv").config();

const DB_URL = process.env.MONGODB_URL;

const checkCoupons = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to DB.");

    const coupons = await Coupon.find({});
    console.log(`Total coupons in db: ${coupons.length}`);
    
    coupons.forEach(c => {
      console.log(`- Code: ${c.couponCode} | Hotel: ${c.hotel} | Admin: ${c.adminEmail}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkCoupons();
