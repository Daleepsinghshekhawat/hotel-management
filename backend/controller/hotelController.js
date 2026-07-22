const hotelModel = require("../model/hotelModel");
const { uploadImage } = require("../utils/cloudinary");

const populateOptions = {
  path: "location",
  select: "cityname state district",
  populate: [
    { path: "state", select: "Statename" },
    { path: "district", select: "districtname" },
  ],
};

exports.getAllHotels = async (req, res) => {
  try {
    const result = await hotelModel
      .find()
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getHotelsByAdmin = async (req, res) => {
  try {
    const { email } = req.params;

    const result = await hotelModel
      .find({ submittedBy: email })
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.softDeleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await hotelModel.findByIdAndUpdate(
      id,
      { status: "inactive" },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Also mark the corresponding hotel request as inactive
    const hotelRequestModel = require("../model/hotelRequestModel");
    if (result.requestId) {
      await hotelRequestModel.findByIdAndUpdate(result.requestId, { status: "inactive" });
    } else if (result.registrationId) {
      await hotelRequestModel.findOneAndUpdate(
        { registrationId: result.registrationId },
        { status: "inactive" }
      );
    }

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and permanently delete from hotelModel
    const deleted = await hotelModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    // Also permanently delete the linked hotelRequest record
    const hotelRequestModel = require("../model/hotelRequestModel");
    if (deleted.requestId) {
      await hotelRequestModel.findByIdAndDelete(deleted.requestId);
    } else if (deleted.registrationId) {
      await hotelRequestModel.findOneAndDelete({ registrationId: deleted.registrationId });
    }

    return res.status(200).json({ success: true, message: "Hotel deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteAllHotels = async (req, res) => {
  try {
    const hotelRequestModel = require("../model/hotelRequestModel");

    // Get all hotels to find linked request IDs
    const allHotels = await hotelModel.find({});
    const registrationIds = allHotels.map((h) => h.registrationId).filter(Boolean);
    const requestIds = allHotels.map((h) => h.requestId).filter(Boolean);

    // Delete all hotels
    await hotelModel.deleteMany({});

    // Delete all linked hotel requests by registrationId or requestId
    if (registrationIds.length > 0) {
      await hotelRequestModel.deleteMany({ registrationId: { $in: registrationIds } });
    }
    if (requestIds.length > 0) {
      await hotelRequestModel.deleteMany({ _id: { $in: requestIds } });
    }

    return res.status(200).json({ success: true, message: "All hotels deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;

    let result = await hotelModel
      .findById(id)
      .populate(populateOptions);

    if (!result) {
      result = await hotelModel
        .findOne({ requestId: id })
        .populate(populateOptions);
    }

    if (!result) {
      const hotelRequestModel = require("../model/hotelRequestModel");
      result = await hotelRequestModel
        .findById(id)
        .populate(populateOptions);
    }

    if (!result) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getHotelsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const result = await hotelModel
      .find({ status })
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { hotelName, ownerName, email, location, description } = req.body;

    let hotel = await hotelModel.findById(id);
    if (!hotel) {
      hotel = await hotelModel.findOne({ requestId: id });
    }

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    let imageUrl = hotel.image;
    if (req.files && req.files.image) {
      const uploadResult = await uploadImage({ image: req.files.image });
      imageUrl = uploadResult[0].secure_url;
    }

    hotel.hotelName = hotelName || hotel.hotelName;
    hotel.ownerName = ownerName || hotel.ownerName;
    hotel.email = email || hotel.email;
    hotel.location = location || hotel.location;
    hotel.description = description || hotel.description;
    hotel.image = imageUrl;

    await hotel.save();

    if (hotel.requestId) {
      const hotelRequest = require("../model/hotelRequestModel");
      await hotelRequest.findByIdAndUpdate(hotel.requestId, {
        hotelName: hotel.hotelName,
        ownerName: hotel.ownerName,
        email: hotel.email,
        location: hotel.location,
        description: hotel.description,
        image: hotel.image,
      });
    }

    return res.status(200).json({ success: true, result: hotel });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};
