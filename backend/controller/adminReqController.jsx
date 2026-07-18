const AdminRequest = require("../model/adminRequestModel");
const User = require("../model/usermodel");

exports.createAdminRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      mobileNumber,
      occupation,
      criminalCase,
    } = req.body;

    const existing = await AdminRequest.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Request already submitted.",
      });
    }

    const request = await AdminRequest.create({
      name,
      email,
      address,
      mobileNumber,
      occupation,
      criminalCase,
    });

    res.status(201).json({
      success: true,
      message: "Admin request submitted successfully.",
      request,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllAdminRequests = async (req, res) => {
  try {
    const requests = await AdminRequest.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


exports.getSingleAdminRequest = async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


exports.approveAdminRequest = async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "approved";
    request.verified = true;

    await request.save();

    await User.findOneAndUpdate(
      { email: request.email },
      {
        role: "admin",
        verified: true,
        status: "approved",
      }
    );

    res.status(200).json({
      success: true,
      message: "Admin approved successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.rejectAdminRequest = async (req, res) => {
  try {
    const { remarks } = req.body;

    const request = await AdminRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "rejected";
    request.verified = false;
    request.remarks = remarks || "";

    await request.save();

    await User.findOneAndUpdate(
      { email: request.email },
      {
        status: "rejected",
        verified: false,
      }
    );

    res.status(200).json({
      success: true,
      message: "Request rejected.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};