const usermodel = require("../model/usermodel");
const hotelOwnerModel = require("../model/hotelOwnerModel");
const AdminAccount = require("../model/adminAccountModel");
const superAdminModel = require("../model/superAdminModel");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = "mySecretkey";

const { sendEmail } = require("../utils/helper"); //it is use as to send  email 
const { generateOTP } = require("../utils/helper");


exports.signup = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    email = email?.toLowerCase().trim();

    if (!(email && name && password)) {
      return res.status(404).json({ message: "all field are required" });
    }

    const userexist = (await usermodel.findOne({ email })) || (await hotelOwnerModel.findOne({ email }));

    if (userexist) {
      return res.status(409).json({ message: "user already exist " });
    }

    const saltround = 10;
    const salt = await bcrypt.genSalt(saltround);              //we use three lines to generate the secure hashpassword 
    const hashPassword = await bcrypt.hashSync(password, salt);

    const result = await usermodel.create({
      name,
      email,
      password: hashPassword,
      role: role || "user",
    });
    try {
      await sendEmail({
        //here  we use this sendmail function to send email on signup
        to: email,
        subject: "🎉 Welcome to Our Platform!",
        html: `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;background:#f4f4f4;padding:30px;">
        
        <div style="background:#2563eb;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
          <h1 style="color:white;margin:0;">Welcome!</h1>
        </div>

        <div style="background:white;padding:30px;border-radius:0 0 10px 10px;">
          <h2>Hello ${name} 👋</h2>

          <p style="font-size:16px;color:#555;line-height:1.7;">
            Thank you for creating your account.
            We're excited to have you with us.
          </p>

          <p style="font-size:16px;color:#555;line-height:1.7;">
            You can now explore all the features available on our platform.
          </p>

          <div style="text-align:center;margin:35px 0;">
            <a
              href="http://localhost:5173/login"
              style="
                background:#2563eb;
                color:white;
                text-decoration:none;
                padding:14px 28px;
                border-radius:8px;
                display:inline-block;
                font-size:16px;
                font-weight:bold;
              "
            >
              Login Now
            </a>
          </div>

          <hr style="border:none;border-top:1px solid #ddd;">

          <p style="color:#888;font-size:14px;">
            If you did not create this account, please ignore this email.
          </p>

          <p style="margin-top:30px;">
            Regards,<br>
            <strong>Your Team</strong>
          </p>
        </div>

      </div>
    `,
      });
    } catch (err) {
      console.log("email failed:", err.message);
    }


    return res.status(200).json({ message: "signup sucessfull", result });


  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};


exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim();

    if (!(email && password)) {
      return res.status(404).json({ message: "alll field are required" });
    }

    // 1. Check for normal user
    let user = await usermodel.findOne({ email });
    let hotelUser = null;
    let adminUser = null;

    
    if (!user) {
      hotelUser = await hotelOwnerModel.findOne({ email });
    }
  
    if (!user && !hotelUser) {
      const adminAcc = await AdminAccount.findOne({ email, status: "approved" });
      if (adminAcc) {
        adminUser = {
          _id: adminAcc._id,
          name: adminAcc.name,
          email: adminAcc.email,
          password: adminAcc.password,
          role: "admin",
        };
      }
    }

    let superAdminUser = null;
    if (!user && !hotelUser && !adminUser) {
      superAdminUser = await superAdminModel.findOne({ email });
    }

    const finalUser = user || hotelUser || adminUser || superAdminUser;

    if (!finalUser) {
      return res.status(404).json({ message: "user must signup first" });
    }

    const checkPassword = bcrypt.compareSync(password, finalUser.password);

    if (!checkPassword) {
      return res.status(404).json({ message: "password not matched" });
    }

    const token = jwt.sign({ email }, process.env.secretkey);

    if (!token) {
      return res.status(404).json({ message: "token not found " });
    }

    res.status(200).json({
      message: "user login sucessfully ",
      token,
      user: finalUser,
    });
  } catch (err) {
    return res.status(500).json({ message: "server error " });
  }
};




exports.forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    email = email?.toLowerCase().trim();
    console.log(email);

    let user = await usermodel.findOne({ email });
    if (!user) {
      user = await hotelOwnerModel.findOne({ email });
    }
    if (!user) {
      const AdminAccount = require("../model/adminAccountModel");
      user = await AdminAccount.findOne({ email, status: "approved" });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = generateOTP(6);
    console.log("otp:", otp);

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    await sendEmail({
      to:email,
      subject:"Password Reset OTP",
      html:`Your OTP is ${otp}. It will expire in 5 minutes`
    });

  res.status(200).json({
    message: "OTP sent successfully",
  });
} catch (error) {
  res.status(500).json({
    message: error.message,
  });
}
};





exports.verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = email?.toLowerCase().trim();

    let user = await usermodel.findOne({ email });
    if (!user) {
      user = await hotelOwnerModel.findOne({ email });
    }
    if (!user) {
      const AdminAccount = require("../model/adminAccountModel");
      user = await AdminAccount.findOne({ email, status: "approved" });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.otp != otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    res.status(200).json({
      message: "OTP verified",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    let { email, password } = req.body;

    let user = await usermodel.findOne({ email });
    if (!user) {
      user = await hotelOwnerModel.findOne({ email });
    }
    if (!user) {
      const AdminAccount = require("../model/adminAccountModel");
      user = await AdminAccount.findOne({ email, status: "approved" });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    user.password = hashPassword;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    if (user.role === "admin") {
      await AdminAccount.findOneAndUpdate({ email: user.email }, { password: hashPassword });
    }

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};