require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("./model/hotelModel");

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
  "https://loremflickr.com/800/600/hotel,resort?random=1",
  "https://loremflickr.com/800/600/hotel,resort?random=2",
  "https://loremflickr.com/800/600/hotel,resort?random=3",
  "https://loremflickr.com/800/600/hotel,resort?random=4",
  "https://loremflickr.com/800/600/hotel,resort?random=5",
  "https://loremflickr.com/800/600/hotel,resort?random=6",
  "https://loremflickr.com/800/600/hotel,resort?random=7",
  "https://loremflickr.com/800/600/hotel,resort?random=8",
  "https://loremflickr.com/800/600/hotel,resort?random=9",
  "https://loremflickr.com/800/600/hotel,resort?random=10",
  "https://loremflickr.com/800/600/hotel,resort?random=11",
  "https://loremflickr.com/800/600/hotel,resort?random=12",
  "https://loremflickr.com/800/600/hotel,resort?random=13",
  "https://loremflickr.com/800/600/hotel,resort?random=14"
];

const runFixer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected");

    const hotels = await Hotel.find({});
    console.log(`Found ${hotels.length} hotels. Reassigning to guaranteed loaded images.`);

    for (let i = 0; i < hotels.length; i++) {
      const hotel = hotels[i];
      // Assign unique image
      hotel.image = guaranteedHotelImages[i];
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
