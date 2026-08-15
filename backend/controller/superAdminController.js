const userModel = require("../model/usermodel");
const hotelOwnerModel = require("../model/hotelOwnerModel");
const superAdminModel = require("../model/superAdminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    let result = [];
    if (role === "all") {
      const normalUsers = await userModel.find({});
      const hotelOwners = await hotelOwnerModel.find({});
      result = [...normalUsers, ...hotelOwners];
    } else if (role === "hotelOwner") {
      const ownersFromOwnersColl = await hotelOwnerModel.find({});
      const ownersFromUsersColl = await userModel.find({ role: "hotelOwner" });
      result = [...ownersFromOwnersColl, ...ownersFromUsersColl];
    } else if (role === "admin") {
      result = await userModel.find({ role: "admin" });
    } else {
      result = await userModel.find({ role });
    }
    // Sort by createdAt descending
    result.sort((a, b) => b.createdAt - a.createdAt);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

exports.getPaginatedUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10, excludeAdmins, search } = req.query;
    
    let result = [];
    if (role === "all") {
      let filter = {};
      if (excludeAdmins === 'true') {
        filter = { role: { $nin: ["admin", "superadmin"] } };
      }
      const normalUsers = await userModel.find(filter);
      const hotelOwners = await hotelOwnerModel.find({});
      result = [...normalUsers, ...hotelOwners];
    } else if (role === "hotelOwner") {
      const ownersFromOwnersColl = await hotelOwnerModel.find({});
      const ownersFromUsersColl = await userModel.find({ role: "hotelOwner" });
      result = [...ownersFromOwnersColl, ...ownersFromUsersColl];
    } else if (role === "admin") {
      result = await userModel.find({ role: "admin" });
    } else {
      result = await userModel.find({ role });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }

    result.sort((a, b) => b.createdAt - a.createdAt);

    const totalDocuments = result.length;
    const totalPages = Math.ceil(totalDocuments / parseInt(limit));
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const paginatedResult = result.slice(skip, skip + parseInt(limit));

    return res.status(200).json({ 
      success: true, 
      result: paginatedResult,
      pagination: {
        totalItems: totalDocuments,
        totalPages,
        currentPage: parseInt(page),
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    const email = user ? user.email : null;

    let deleted = await userModel.findByIdAndDelete(id);
    if (deleted && email) {
      const AdminAccount = require("../model/adminAccountModel");
      await AdminAccount.findOneAndDelete({ email });
    }
    
    if (!deleted) {
      deleted = await hotelOwnerModel.findByIdAndDelete(id);
    }
    
    if (!deleted) {
      const AdminAccount = require("../model/adminAccountModel");
      const adminAcc = await AdminAccount.findById(id);
      if (adminAcc) {
        await userModel.findOneAndDelete({ email: adminAcc.email });
        deleted = await AdminAccount.findByIdAndDelete(id);
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!["admin", "superadmin", "user", "hotelOwner"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });
    
    if (user) {
      const AdminAccount = require("../model/adminAccountModel");
      await AdminAccount.findOneAndUpdate({ email: user.email }, { role });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User role updated successfully", user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};


