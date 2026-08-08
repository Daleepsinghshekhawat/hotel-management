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

async function buildSearchFilter(search) {
  let orFilter = [
    { hotelName: { $regex: search, $options: "i" } },
    { ownerName: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } }
  ];

  const cityModel = require("../model/citymodel");
  const districtModel = require("../model/districtmodel");
  const stateModel = require("../model/statemodel");

  const matchedStates = await stateModel.find({ Statename: { $regex: search, $options: "i" } }).select('_id');
  const stateIds = matchedStates.map(s => s._id);

  const matchedDistricts = await districtModel.find({ districtname: { $regex: search, $options: "i" } }).select('_id');
  const districtIds = matchedDistricts.map(d => d._id);

  const cityOrQuery = [
    { cityname: { $regex: search, $options: "i" } }
  ];

  if (districtIds.length > 0) {
    cityOrQuery.push({ district: { $in: districtIds } });
  }

  if (stateIds.length > 0) {
    cityOrQuery.push({ state: { $in: stateIds } });
  }

  const matchedCities = await cityModel.find({ $or: cityOrQuery }).select('_id');
  const cityIds = matchedCities.map(c => c._id);

  if (cityIds.length > 0) {
    orFilter.push({ location: { $in: cityIds } });
  }

  return orFilter;
}

exports.getAllHotels = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let filter = {};
    if (search) {
      filter.$or = await buildSearchFilter(search);
    }

    let sortOption = {};
    if (sort === "a-z") sortOption.hotelName = 1;
    else if (sort === "z-a") sortOption.hotelName = -1;
    else if (sort === "oldest") sortOption.createdAt = 1;
    else sortOption.createdAt = -1;

    const result = await hotelModel
      .find(filter)
      .populate(populateOptions)
      .sort(sortOption);

    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getHotelsByAdmin = async (req, res) => {
  try {
    const { email } = req.params;
    const { search, sort } = req.query;
    let filter = { submittedBy: email };

    if (search) {
      filter.$or = await buildSearchFilter(search);
    }

    let sortOption = {};
    if (sort === "a-z") sortOption.hotelName = 1;
    else if (sort === "z-a") sortOption.hotelName = -1;
    else if (sort === "oldest") sortOption.createdAt = 1;
    else sortOption.createdAt = -1;

    const result = await hotelModel
      .find(filter)
      .populate(populateOptions)
      .sort(sortOption);

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
    const { search, sort, page = 1, limit = 10 } = req.query;

    let filter = { status };

    if (search) {
      filter.$or = await buildSearchFilter(search);
    }

    let sortOption = {};
    if (sort === "a-z") sortOption.hotelName = 1;
    else if (sort === "z-a") sortOption.hotelName = -1;
    else if (sort === "oldest") sortOption.createdAt = 1;
    else sortOption.createdAt = -1;

    // Use hotels.length to get total documents as requested
    const allHotels = await hotelModel.find(filter);
    const totalDocuments = allHotels.length;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalPages = Math.ceil(totalDocuments / parseInt(limit));

    const result = await hotelModel
      .find(filter)
      .populate(populateOptions)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      result,
      pagination: {
        totalItems: totalDocuments,
        totalPages,
        currentPage: parseInt(page),
      }
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
    const { hotelName, ownerName, email, location, description, hotelType, amenities } = req.body;

    let hotel = await hotelModel.findById(id);
    if (!hotel) {
      hotel = await hotelModel.findOne({ requestId: id });
    }

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    let imageUrls = hotel.images || [];
    if (req.files && req.files.images) {
      const uploadResult = await uploadImage({ image: req.files.images });
      imageUrls = uploadResult.map(res => res.secure_url);
    } else if (req.files && req.files.image) {
      const uploadResult = await uploadImage({ image: req.files.image });
      imageUrls = uploadResult.map(res => res.secure_url);
    }

    hotel.hotelName = hotelName || hotel.hotelName;
    hotel.ownerName = ownerName || hotel.ownerName;
    hotel.email = email || hotel.email;
    hotel.location = location || hotel.location;
    hotel.description = description || hotel.description;
    hotel.images = imageUrls;
    if (hotelType) hotel.hotelType = hotelType;
    if (amenities) hotel.amenities = JSON.parse(amenities);

    await hotel.save();

    if (hotel.requestId) {
      const hotelRequest = require("../model/hotelRequestModel");
      await hotelRequest.findByIdAndUpdate(hotel.requestId, {
        hotelName: hotel.hotelName,
        ownerName: hotel.ownerName,
        email: hotel.email,
        location: hotel.location,
        description: hotel.description,
        images: hotel.images,
        hotelType: hotel.hotelType,
        amenities: hotel.amenities
      });
    }

    return res.status(200).json({ success: true, result: hotel });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};
