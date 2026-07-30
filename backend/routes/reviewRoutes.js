const express = require("express");
const router = express.Router();
const reviewController = require("../controller/reviewController");

router.post("/addReview", reviewController.addReview);
router.get("/getReviewsByHotel/:hotelId", reviewController.getReviewsByHotel);
router.get("/getAllReviews", reviewController.getAllReviews);
router.delete("/deleteReview/:id", reviewController.deleteReview);

module.exports = router;
