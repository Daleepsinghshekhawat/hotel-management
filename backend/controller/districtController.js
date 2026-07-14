const districtModel = require("../model/districtmodel");

const statemodel = require("../model/statemodel");


exports.createDistrict = async (req, res) => {
    try {
        const { districtname, stateId} = req.body;
        
        if (!districtname || !stateId) {
            return res.status(400).json({ message: "districtname and stateId are required" });
        }
        const result = await districtModel.create({ districtname, stateId });
        return res.status(200).json({result});

    }catch(err){
        return res.status(500).json({message:"server error occured"})
    }
    }


    exports.getAllDistrict = async (req, res) => {
        try {
            const result = await statemodel.aggregate([
                {
                    $match: { status: "active" }
                },
                {
                    $lookup: {
                        from: "districts",
                        localField: "_id",
                        foreignField: "stateId",
                        as: "districts"
                    }
                },
                {
                    $unwind: "$districts"
                }
            ]);
            if (!result) {
                return res.status(404).json({ message: "district is not found " });
            }
            return res.status(200).json({ result });

        } catch (err) {
            return res.status(500).json({ message: "server error occured" });
        }
    }


    exports.getInactiveDistrict = async (req, res) => {
        
        try {
                       const result = await statemodel.aggregate([
                         {
                           $match: { status: "inactive" },
                         },
                         {
                           $lookup: {
                             from: "districts",
                             localField: "_id",
                             foreignField: "stateId",
                             as: "districts",
                           },
                         },
                         {
                           $unwind: "$districts",
                         },
                       ]);

            if (!result) {
                return res.status(404).json({ message: "inactive district is not found " });
            }
            return res.status(200).json({ result });

        } catch (err) {
            return res.status(500).json({ message: "server error occured" });
        }
    } //write it again  



    exports.getDistrictbyid = async (req, res) => {
try{
    console.log(req.params);

    const { id } = req.params;
    const result = await districtModel.aggregate([
      {
        $match: {},
      },
      {
        $lookup: {
          from: "states",
          localField: "stateId",
          foreignField: "_id",
          as: "states",
        },
      },
      {
        $unwind: "$states",
      },
    ]);
    if (!result) {
        return res.status(404).json({ message: "district is not found" });
    }
    return res.status(200).json({ result });
}catch(err){
    return res.status(500).json({ message: "server error occured" });
}
    }