const AdminAccount = require("../model/adminAccountModel");
const AdminRequest = require("../model/adminReqModel");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/helper");

exports.createAdminAccount = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await AdminAccount.findOne({ email });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Email already registered.",
            });
        }


        const admin = await AdminAccount.create({
            name,
            email,
            password: "",
            role: "user",
            verified: false,
            status: "pending",
        });

        res.status(201).json({
            success: true,
            message: "Admin account created successfully.",
            admin,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllAdminAccounts = async (req, res) => {
    try {
        const admins = await AdminAccount.find().sort({
            createdAt: -1,
        });

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


// exports.approveAdmin = async (req, res) => {
//     try {
//         const admin = await AdminAccount.findById(req.params.id);

//         if (!admin) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Admin account not found.",
//             });
//         }

//         const tempPassword = Math.random().toString(36).slice(-8);
//         const hashPassword = await bcrypt.hash(tempPassword, 10);

//         admin.password = hashPassword,
//             admin.role = "admin";
//         admin.verified = true;
//         admin.status = "approved";

//         await admin.save();

//         res.status(200).json({
//             success: true,
//             message: "Admin approved successfully.",
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

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

    // Update request status
    await AdminRequest.findOneAndUpdate(
      { email: admin.email },
      { status: "approved" }
    );
      
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