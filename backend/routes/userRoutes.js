const express = require("express");
const router = express.Router();
const userController = require("../controller/userController") ;

router.post("/signup",userController.signup);
router.post("/login",userController.login);

router.post("/forgotPassword", userController.forgotPassword);

router.post("/verifyOtp", userController.verifyOtp);

router.post("/resetPassword", userController.resetPassword);

module.exports = router;