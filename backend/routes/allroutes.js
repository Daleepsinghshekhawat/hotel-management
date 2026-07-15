const express = require("express");
const router = express.Router();

const stateController = require("../controller/stateController");
const districtController = require("../controller/districtController");
const cityController = require("../controller/cityController");
const hotelRequestController = require("../controller/hotelRequestController");

router.post("/addState", stateController.createState);
router.get("/getAllState", stateController.getAllState);
router.get("/getInactiveState", stateController.getInactiveState);
router.get("/getStateById/:id", stateController.getStatebyid);
router.patch("/updateState/:id", stateController.updateState);
router.delete("/deleteState/:id", stateController.deleteState);
router.patch("/softDeleteState/:id", stateController.softDeleteState);
router.patch("/restoreState/:id", stateController.restoreState);

// routes of districtcontroller
router.post("/createDistrict", districtController.createDistrict);
router.get("/getAllDistrict", districtController.getAllDistrict);
router.get("/getDistrictByState/:stateId", districtController.getDistrictByState);
router.get("/getInactiveDistrict", districtController.getInactiveDistrict);
router.get("/getDistrictbyid/:id", districtController.getDistrictbyid);
router.patch("/updateDistrict/:id", districtController.updateDistrict);
router.delete("/deleteDistrict/:id", districtController.deleteDistrict);
router.patch("/softDeleteDistrict/:id", districtController.softDeleteDistrict);
router.patch("/restoreDistrict/:id", districtController.restoreDistrict);

// routes of citycontroller
router.post("/createCity", cityController.createCity);
router.get("/getAllCity", cityController.getAllCity);
router.get("/getCityByDistrict/:districtId", cityController.getCityByDistrict);
router.get("/getInactiveCity", cityController.getInactiveCity);
router.get("/getCityById/:id", cityController.getCityById);
router.patch("/updateCity/:id", cityController.updateCity);
router.delete("/deleteCity/:id", cityController.deleteCity);
router.patch("/softDeleteCity/:id", cityController.softDeleteCity);
router.patch("/restoreCity/:id", cityController.restoreCity);

// routes of hotelRequestController
router.post("/submitHotelRequest", hotelRequestController.submitRequest);
router.get("/getAllHotelRequests", hotelRequestController.getAllRequests);
router.get("/getHotelRequestsByStatus/:status", hotelRequestController.getRequestsByStatus);
router.patch("/approveHotelRequest/:id", hotelRequestController.approveRequest);
router.patch("/rejectHotelRequest/:id", hotelRequestController.rejectRequest);

// ── Cloudinary health-check ─────────────────────────────────────────────────
// GET http://localhost:3000/api/testCloudinary
// Returns 200 if your Cloudinary keys are correct, 400/500 otherwise.
router.get("/testCloudinary", hotelRequestController.testCloudinary);

// ── Fix old hotel requests that have images:[] ────────────────────────────────
// PATCH http://localhost:3000/api/updateHotelImages/:id
// SuperAdmin uploads base64 images → uploaded to Cloudinary → saved to MongoDB
router.patch("/updateHotelImages/:id", hotelRequestController.updateHotelImages);

// ── Delete a hotel request permanently ───────────────────────────────────────
// DELETE http://localhost:3000/api/deleteHotelRequest/:id
router.delete("/deleteHotelRequest/:id", hotelRequestController.deleteRequest);

module.exports = router;

