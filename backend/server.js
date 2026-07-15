
require("dotenv").config(); // it is used to acess .env file data  as config add all variabale in  process.env

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json({ limit: "50mb" })); // 50 MB limit — needed for base64 image uploads to Cloudinary
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cors()); //without it no request get called or approved from backend



// const url = process.env.MONGODB_URL;

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("db connection sucessful ");
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT;
const userRoutes = require("./routes/userRoutes")
const allRoutes = require("./routes/allroutes");

app.use("/api", allRoutes);

app.use("/users",userRoutes);

app.listen(PORT, () => {
  console.log(`server run on this ${PORT}`);
});
