
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const os=require("os");

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT || 5000;

const userRoutes = require("./routes/userRoutes");
const allRoutes = require("./routes/allroutes");

app.use("/users", userRoutes);
app.use("/api", allRoutes);

// Initialize background cron jobs
require("./utils/cronJobs");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});