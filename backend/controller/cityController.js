const cityModel = require("../model/citymodel");

exports.createCity = async (req, res) => {
  try {
    console.log(req.body);

    const { cityname, state, district } = req.body;

    if (!cityname || !state || !district) {
      return res.status(400).json({
        message: "cityname, state and district are required",
      });
    }

    const result = await cityModel.create({
      cityname,
      state,
      district,
    });

    console.log(result);

    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server error occurred",
    });
  }
};

exports.getAllCity = async (req, res) => {
    try {
        const { stateId } = req.params;
        const { search } = req.query;

         console.log("State Id:", stateId);

        let query = {
            state: stateId,
            status: "active"
        };

        if (search) {
            query.$or = [
                { cityname: { $regex: search, $options: "i" } }
            ];
        }

        const result = await cityModel.find(query);

        res.status(200).json({ result });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCityByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;
    const result = await cityModel
      .find({ district: districtId })
      .populate({ path: "district", populate: { path: "stateId" } });
    if (!result) return res.status(404).json({ message: "cities not found for this district" });
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.getInactiveCity = async (req, res) => {
  try {
    const result = await cityModel
      .find({ status: "inactive" })
      .populate({ path: "district", populate: { path: "stateId" } });
    if (!result) return res.status(404).json({ message: "inactive cities not found" });
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.getCityById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cityModel
      .findById(id)
      .populate({ path: "district", populate: { path: "stateId" } });
    if (!result) return res.status(404).json({ message: "city not found" });
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { cityname, district } = req.body;
    if (!cityname || !district) {
      return res.status(400).json({ message: "cityname and district are required" });
    }
    const result = await cityModel.findByIdAndUpdate(
      id,
      { cityname, district },
      { new: true }
    );
    if (!result) return res.status(404).json({ message: "city not found" });
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cityModel.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: "city not found" });
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.softDeleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cityModel.findByIdAndUpdate(id, { status: "inactive" });
    if (!result) return res.status(404).json({ message: "city not found" });
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

exports.restoreCity = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cityModel.findByIdAndUpdate(
      id,
      { status: "active" },
      { new: true }
    );
    if (!result) return res.status(404).json({ message: "city not found" });
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};
