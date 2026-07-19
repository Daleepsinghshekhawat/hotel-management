const userModel = require("../model/usermodel");
const hotelOwnerModel = require("../model/hotelOwnerModel");

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    let result = [];
    if (role === "all") {
      const normalUsers = await userModel.find({}).select("-password");
      const hotelOwners = await hotelOwnerModel.find({}).select("-password");
      result = [...normalUsers, ...hotelOwners];
    } else if (role === "hotelOwner") {
      result = await hotelOwnerModel.find({}).select("-password");
    } else {
      result = await userModel.find({ role }).select("-password");
    }
    // Sort by createdAt descending
    result.sort((a, b) => b.createdAt - a.createdAt);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = await userModel.findByIdAndDelete(id);
    if (!deleted) {
      deleted = await hotelOwnerModel.findByIdAndDelete(id);
    }
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};
