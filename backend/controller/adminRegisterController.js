const AdminAccount = require("../model/adminAccountModel");
const AdminRequest = require("../model/adminReqModel");





//this controller creted to do 2 task at atome create the admin and crate the adminreq in adminreq and save in db




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

    // Check pending request
    const requestExists = await AdminRequest.findOne({
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
      await adminExists.save();
    } else {
      await AdminAccount.create({
        name,
        email,
        password: "",
        role: "user",
        verified: false,
        status: "pending",
      });
    }

    await AdminRequest.create({
      name,
      email,
      address,
      mobileNumber,
      occupation,
      criminalCase,
      role: "user",
      verified: false,
      status: "pending",
    });

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
