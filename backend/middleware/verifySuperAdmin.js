const jwt = require("jsonwebtoken");
const superAdminModel = require("../model/superAdminModel");

const verifySuperAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    
    // We are using process.env.secretkey as per your userController.js
    const decoded = jwt.verify(token, process.env.secretkey);

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied: Superadmin only" });
    }

    const admin = await superAdminModel.findOne({ email: decoded.email });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Superadmin account not found" });
    }

    req.user = decoded; // add decoded payload to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token is invalid or expired", error: err.message });
  }
};

module.exports = verifySuperAdmin;
