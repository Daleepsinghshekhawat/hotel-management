const AdminAccount = require("../model/adminAccountModel");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/helper");


exports.getAllAdminAccounts = async (req, res) => {
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

        const admins = await AdminAccount.find(filter).sort(sortOption);

        res.status(200).json({
            success: true,
            admins,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getSingleAdminAccount = async (req, res) => {
    try {
        const admin = await AdminAccount.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin account not found.",
            });
        }

        res.status(200).json({
            success: true,
            admin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.approveAdmin = async (req, res) => {
  try {
    const admin = await AdminAccount.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    // Generate random password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Hash password
    const hashPassword = await bcrypt.hash(tempPassword, 10);

    // Update admin account
    admin.password = hashPassword;
    admin.role = "admin";
    admin.verified = true;
    admin.status = "approved";

    await admin.save();
      
     // Send email here using tempPassword
     await sendEmail({
      to: admin.email,
      subject: "Admin Request Approved",
      html: `
        <h2>Congratulations!</h2>
        <p>Your admin request has been approved.</p>

        <p><strong>Email:</strong> ${admin.email}</p>
        <p><strong>Password:</strong> ${tempPassword}</p>

        <p>Please login using this password and change it after your first login.</p>
      `,
    });
 

    return res.status(200).json({
      success: true,
      message: "Admin approved successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.rejectAdmin = async (req, res) => {
    try {
        const admin = await AdminAccount.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin account not found.",
            });
        }

        admin.status = "rejected";
        admin.verified = false;

        await admin.save();

        res.status(200).json({
            success: true,
            message: "Admin request rejected.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

///this is for admin registration request from user tosuperadmin
exports.registerAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      mobileNumber,
      occupation,
      criminalCase,
    } = req.body;

    if (!name || !email || !address || !mobileNumber || !occupation) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    // Check AdminAccount
    const adminExists = await AdminAccount.findOne({ email });

    if (adminExists && adminExists.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Email already registered as admin.",
      });
    }

    // Check pending request in AdminAccount instead of AdminRequest
    const requestExists = await AdminAccount.findOne({
      email,
      status: "pending",
    });

    if (requestExists) {
      return res.status(400).json({
        success: false,
        message: "Your request is already pending.",
      });
    }

    if (adminExists) {
      adminExists.name = name;
      adminExists.password = "";
      adminExists.role = "user";
      adminExists.verified = false;
      adminExists.status = "pending";
      adminExists.address = address;
      adminExists.mobileNumber = mobileNumber;
      adminExists.occupation = occupation;
      adminExists.criminalCase = criminalCase;
      await adminExists.save();
    } else {
      await AdminAccount.create({
        name,
        email,
        password: "",
        role: "user",
        verified: false,
        status: "pending",
        address,
        mobileNumber,
        occupation,
        criminalCase,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Admin request submitted successfully.",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
