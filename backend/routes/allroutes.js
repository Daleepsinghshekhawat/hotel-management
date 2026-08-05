const express = require("express");
const router = express.Router();

const stateController = require("../controller/stateController");
const districtController = require("../controller/districtController");
const cityController = require("../controller/cityController");

const adminController = require("../controller/adminRegisterController");

const adminReqController = require("../controller/adminReqController");
const roomController = require("../controller/roomController");
const hotelController = require("../controller/hotelController");
const hotelRequestController = require("../controller/hotelRequestController");
const superAdminController = require("../controller/superAdminController");
const bookingController = require("../controller/bookingController");

const couponController = require("../controller/couponController");











router.post("/createCoupon", couponController.createCoupon);

router.get("/getCoupons", couponController.getAllCoupons);

router.get("/getCouponsByAdmin/:email", couponController.getCouponsByAdmin);

router.get("/getCoupon/:id", couponController.getCouponById);

router.patch("/updateCoupon/:id", couponController.updateCoupon);

router.patch("/changeCouponStatus/:id", couponController.changeCouponStatus);

router.delete("/deleteCoupon/:id", couponController.deleteCoupon);















router.post(
    "/submitHotelRequest",
    hotelRequestController.submitHotelRequest
);
router.get(
    "/getAllHotelRequests",
    hotelRequestController.getAllHotelRequests
);
router.get(
    "/getPaginatedHotelRequests",
    hotelRequestController.getPaginatedHotelRequests
);

router.get(
    "/getRequestsByStatus",
    hotelRequestController.getRequestsByStatus
);  // Usage: GET /api/getRequestsByStatus?status=pending


router.get(
    "/getRequestsByAdmin/:email",
    hotelRequestController.getRequestsByAdmin
);

router.get(
    "/getHotelRequestsByAdmin/:email",
    hotelRequestController.getRequestsByAdmin
);

router.patch(
    "/approveHotelRequest/:id",
    hotelRequestController.approveRequest
);

router.patch(
    "/rejectHotelRequest/:id",
    hotelRequestController.rejectRequest
);

router.delete(
    "/deleteHotelRequest/:id",
    hotelRequestController.deleteRequest
);

router.post(
    "/addHotelDirect",
    hotelRequestController.addHotelDirect
);





















router.get(
    "/getAllHotels",
    hotelController.getAllHotels
);

router.get(
    "/getHotelsByAdmin/:email",
    hotelController.getHotelsByAdmin
);


router.get(
    "/getHotelById/:id",
    hotelController.getHotelById
);

router.get(
  "/getHotelsByStatus/:status",
  hotelController.getHotelsByStatus
);

router.patch(
  "/softDeleteHotel/:id",
  hotelController.softDeleteHotel
);

router.delete(
  "/deleteHotel/:id",
  hotelController.deleteHotel
);

router.delete(
  "/deleteAllHotels",
  hotelController.deleteAllHotels
);

router.patch(
  "/updateHotel/:id",
  hotelController.updateHotel
);





// rooms route
router.post("/addRoom", roomController.addRoom);
router.get(
    "/getRoomsByHotel/:hotelId",
    roomController.getRoomsByHotel
);
router.get(
"/getRoom/:id",
roomController.getSingleRoom
);
router.patch(
"/deleteRoom/:id",
roomController.deleteRoom
);
router.patch(
"/updateRoom/:id",
roomController.updateRoom
);






console.log("adminController", adminController);

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
router.get("/getAllCity/:stateId", cityController.getAllCity);
router.get("/getCityByDistrict/:districtId", cityController.getCityByDistrict);
router.get("/getInactiveCity", cityController.getInactiveCity);
router.get("/getCityById/:id", cityController.getCityById);
router.patch("/updateCity/:id", cityController.updateCity);
router.delete("/deleteCity/:id", cityController.deleteCity);
router.patch("/softDeleteCity/:id", cityController.softDeleteCity);
router.patch("/restoreCity/:id", cityController.restoreCity);


//to create the adminuser and adminaccount req 

router.post("/register", adminController.registerAdmin);
router.get("/getAllAdminRequests",adminReqController.getAllAdminRequests)
router.get("/getPaginatedAdminRequests",adminReqController.getPaginatedAdminRequests)
router.get("/getAdminRequestsByStatus/:status",adminReqController.getAdminRequestsByStatus)
router.patch("/approveAdminRequest/:id",adminReqController.approveAdminRequest)
router.patch("/rejectAdminRequest/:id",adminReqController.rejectAdminRequest)
router.delete("/deleteAdminRequest/:id",adminReqController.deleteAdminRequest)
router.post("/addAdminDirect", adminReqController.addAdminDirect)

// User management routes for SuperAdmin
router.get("/getUsersByRole/:role", superAdminController.getUsersByRole);
router.get("/getPaginatedUsersByRole/:role", superAdminController.getPaginatedUsersByRole);
router.delete("/deleteUser/:id", superAdminController.deleteUser);


// ── Booking Routes ──────────────────────────────────────────
router.post("/createBooking", bookingController.createBooking);
router.get("/checkAvailability/:roomId", bookingController.checkAvailability);
router.get("/room/:roomId/calendar", bookingController.getRoomCalendarAvailability);
router.post("/room/:roomId/temp-lock", bookingController.acquireTempLock);
router.get("/getRoomBookingStatus/:roomId", bookingController.getRoomBookingStatus);
router.get("/getBookingsByHotel/:hotelId", bookingController.getBookingsByHotel);
router.get("/getAllBookings", bookingController.getAllBookings);
router.get("/getBookingsByGuest/:email", bookingController.getBookingsByGuest);
router.patch("/cancelBooking/:id", bookingController.cancelBooking);
router.patch("/checkInBooking/:id", bookingController.checkInBooking);
router.patch("/checkoutBooking/:id", bookingController.checkoutBooking);
const reviewRoutes = require("./reviewRoutes");
router.use("/reviews", reviewRoutes);

router.get("/test", (req, res) => {
  res.send("API is working");
});

module.exports = router;

