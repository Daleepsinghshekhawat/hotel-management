const AdminRequest = require("../model/adminReqModel");
const AdminAccount = require("../model/adminAccountModel");
const userModel = require("../model/usermodel");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../utils/helper");

exports.getAllAdminRequests = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    
    let sortOption = {};
    if (sort === "a-z") sortOption.name = 1;
    else if (sort === "z-a") sortOption.name = -1;
    else if (sort === "oldest") sortOption.createdAt = 1;
    else sortOption.createdAt = -1;

    const result = await AdminRequest.find(filter).sort(sortOption);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getAdminRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const result = await AdminRequest.find({ status }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.approveAdminRequest = async (req, res) => {

  console.log("req.data:",req.params);
  
  try {
    const { id } = req.params;

    const request = await AdminRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Admin request not found",
      });
    }

    if (request.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "This admin request is already approved",
      });
    }

    const tempPassword = uuidv4().replace(/-/g, "").slice(0, 10);
    const hashPassword = await bcrypt.hash(tempPassword, 10);

    request.status = "approved";
    request.verified = true;
    request.role = "admin";
    request.rejectionReason = "";
    await request.save();

    await AdminAccount.findOneAndUpdate(
      { email: request.email },
      {
        password: hashPassword,
        role: "admin",
        verified: true,
        status: "approved",
      }
    );

    let existingUser = await userModel.findOne({ email: request.email });
    if (!existingUser) {
      existingUser = await userModel.create({
        name: request.name,
        email: request.email,
        password: hashPassword,
        role: "admin",
      });
    } else {
      existingUser.name = request.name;
      existingUser.password = hashPassword;
      existingUser.role = "admin";
      await existingUser.save();
    }

    try {
      await sendEmail({
        to: request.email,
        subject: "Admin Request Approved",
        html: `
          <h2>Congratulations ${request.name}!</h2>
          <p>Your admin request has been approved.</p>
          <p>You can now login as an administrator using the credentials below:</p>
          <p><strong>Email:</strong> ${request.email}</p>
          <p><strong>Password:</strong> ${tempPassword}</p>
          <p>Please change your password after your first login.</p>
        `,
      });
    } catch (emailErr) {
      console.log("Approval email failed:", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Admin request approved successfully",
      result: request,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

exports.rejectAdminRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const request = await AdminRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Admin request not found",
      });
    }

    request.status = "rejected";
    request.verified = false;
    request.rejectionReason = rejectionReason.trim();
    await request.save();

    await AdminAccount.findOneAndUpdate(
      { email: request.email },
      {
        verified: false,
        status: "rejected",
      }
    );

    try {
      await sendEmail({
        to: request.email,
        subject: "Admin Request Rejected",
        html: `
          <h2>Hello ${request.name},</h2>
          <p>We are sorry to inform you that your admin request has been rejected.</p>
          <p><strong>Reason:</strong> ${rejectionReason.trim()}</p>
          <p>You may review the reason, update your details, and submit a new request if needed.</p>
          <p>Thank you.</p>
        `,
      });
    } catch (emailErr) {
      console.log("Rejection email failed:", emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Admin request rejected successfully",
      result: request,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

exports.deleteAdminRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AdminRequest.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Admin request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin request deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.addAdminDirect = async (req, res) => {
  try {
    const { name, email, address, mobileNumber, occupation, criminalCase } = req.body;

    if (!name || !email || !address || !mobileNumber || !occupation) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const adminExists = await AdminAccount.findOne({ email });
    const userExists = await userModel.findOne({ email });

    if (adminExists || userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const tempPassword = uuidv4().replace(/-/g, "").slice(0, 10);
    const hashPassword = await bcrypt.hash(tempPassword, 10);

    // Create approved request
    await AdminRequest.create({
      name,
      email,
      address,
      mobileNumber,
      occupation,
      criminalCase: criminalCase === "Yes",
      status: "approved",
      verified: true,
      role: "admin",
    });

    // Create AdminAccount
    await AdminAccount.create({
      name,
      email,
      password: hashPassword,
      role: "admin",
      verified: true,
      status: "approved",
    });

    await userModel.create({
      name,
      email,
      password: hashPassword,
      role: "admin",
    });

    try {
      await sendEmail({
        to: email,
        subject: "Administrator Account Activated",
        html: `
          <h2>Welcome ${name}!</h2>
          <p>Your administrator profile has been created directly by the Super Admin.</p>
          <p>Here are your credentials to log in:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${tempPassword}</p>
          <p>Please change your password after logging in for security.</p>
        `,
      });
    } catch (emailErr) {
      console.log("Direct admin email failed:", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Admin created and approved successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};
