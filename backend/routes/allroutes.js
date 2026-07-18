const express = require("express");
const router = express.Router();

const stateController = require("../controller/stateController");
const districtController = require("../controller/districtController");
const cityController = require("../controller/cityController");

const adminController = require("../controller/adminRegisterController");

const adminReqController = require("../controller/adminReqController");



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


//to create the adminuser and adminaccreq verify

router.post("/register", adminController.registerAdmin);
router.get("/getAllAdminRequests",adminReqController.getAllAdminRequests)
router.get("/getAdminRequestsByStatus/:status",adminReqController.getAdminRequestsByStatus)
router.patch("/approveAdminRequest/:id",adminReqController.approveAdminRequest)
router.patch("/rejectAdminRequest/:id",adminReqController.rejectAdminRequest)
router.delete("/deleteAdminRequest/:id",adminReqController.deleteAdminRequest)


router.get("/test", (req, res) => {
  res.send("API is working");
});

module.exports = router;

