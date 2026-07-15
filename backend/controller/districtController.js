const districtModel = require("../model/districtmodel");
 const statemodel = require("../model/statemodel");// it use for populate 

exports.createDistrict = async (req, res) => {
  try {
    const { districtname, stateId } = req.body;

    if (!districtname || !stateId) {
      return res
        .status(400)
        .json({ message: "districtname and stateId are required" });
    }
    const result = await districtModel.create({ districtname, stateId });
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.getAllDistrict = async (req, res) => {
  try {
    const result = await districtModel
      .find({ status: "active" })
      .populate("stateId")

    if (!result) {
      return res.status(404).json({ message: "district is not found " });
    }
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.getDistrictByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    const result = await districtModel
      .find({ stateId })
      .populate("stateId");

    if (!result) {
      return res
        .status(404)
        .json({ message: "district is not found for this state" });
    }
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.getInactiveDistrict = async (req, res) => {
  try {
    const result = await districtModel
      .find({ status: "inactive" })
      .populate("stateId")
      

    if (!result) {
      return res
        .status(404)
        .json({ message: "inactive district is not found " });
    }
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.getDistrictbyid = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await districtModel
      .findById(id)
      .populate("stateId");

    if (!result) {
      return res.status(404).json({ message: "district is not found" });
    }
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { districtname, stateId } = req.body;

    if (!districtname || !stateId) {
      return res
        .status(400)
        .json({ message: "districtname and stateId are required" });
    }

    const result = await districtModel.findByIdAndUpdate(
      id,
      { districtname, stateId },
      { new: true },
    );

    if (!result) {
      return res.status(404).json({ message: "district is not found" });
    }

    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await districtModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "district is not found" });
    }

    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.softDeleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await districtModel.findByIdAndUpdate(
      id,
      { status: "inactive" }
    );


    if (!result) {
      return res.status(404).json({ message: "district is not found" });
    }

    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.restoreDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await districtModel.findByIdAndUpdate(
      id,
      { status: "active" },
      { new: true },
    );

    if (!result) {
      return res.status(404).json({ message: "district is not found" });
    }

    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};
