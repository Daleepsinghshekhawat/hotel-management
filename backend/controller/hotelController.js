const hotelModel = require("../model/hotelModel");

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
    
    // Also soft delete the corresponding hotel request if possible
    if (result.requestId) {
      const { hotelRequest } = require("../model/hotelRequestModel");
      const hr = require("../model/hotelRequestModel");
      await hr.findByIdAndUpdate(result.requestId, { status: "inactive" });
    } else if (result.registrationId) {
      const hr = require("../model/hotelRequestModel");
      await hr.findOneAndUpdate({ registrationId: result.registrationId }, { status: "inactive" });
    }

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await hotelModel
      .findById(id)
      .populate(populateOptions);

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
