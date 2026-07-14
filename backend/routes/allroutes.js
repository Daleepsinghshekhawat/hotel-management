const express = require("express");
const router = express.Router();


const stateController  = require("../controller/stateController");

const districtController  = require("../controller/districtController");


router.post("/addState", stateController.createState);
router.get("/getAllState", stateController.getAllState);
router.get("/getInactiveState", stateController.getInactiveState);
router.get("/getStateById/:id", stateController.getStatebyid);
router.patch("/updateState/:id", stateController.updateState);
router.delete("/deleteState/:id", stateController.deleteState);
router.patch("/softDeleteState/:id", stateController.softDeleteState);
router.patch("/restoreState/:id", stateController.restoreState);


//routes of districtcontroller


router.post("/createDistrict", districtController.createDistrict);

router.get("/getAllDistrict", districtController.getAllDistrict);

// router.get("/getInactiveDistrict", districtController.getInactiveDistrict);

router.get("/getDistrictbyid/:id", districtController.getDistrictbyid);

// router.patch("/updateDistrict/:id", districtController.updateDistrict);

// router.delete("/deleteDistrict/:id", districtController.deleteDistrict);

// router.patch("/softDeleteDistrict/:id", districtController.softDeleteDistrict);

// router.patch("/restoreDistrict/:id", districtController.restoreDistrict);



//routes of citycontroller





module.exports = router;