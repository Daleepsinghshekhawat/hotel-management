const express = require("express");
const router = express.Router();
const pdfController = require("../controller/pdfController");

router.get("/hotel/:id", pdfController.generateHotelPdf);
router.get("/room/:id", pdfController.generateRoomPdf);
router.get("/coupons", pdfController.generateCouponsPdf);
router.get("/booking/:id", pdfController.generateBookingReceiptPdf);

module.exports = router;
