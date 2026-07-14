const statemodel = require("../model/statemodel");


exports.createState =async(req,res)=>{
    try{
        const { Statename } = req.body;
        if(!Statename){
         return res.status(404).json({message:"statenaem is not found "});
        }
        
        const result = await statemodel.create({ Statename });
        return res.status(200).json({result});
    }catch(err){
        return res.status(500).json({message:"server error occured"})
    }
}

exports.getAllState = async(req,res)=>{
    try{
        
      const result = await statemodel.find({ status: "active" });
      if(!result){
        return res.status(404).json({message:"state is not found "});
      }
      return res.status(200).json({result});

    }catch(err){
        return res.status(500).json({message:"server error occured"})
    }
}

exports.getInactiveState = async (req, res) => {
  try {
    const result = await statemodel.find({ status: "inactive" });
    if (!result) {
      return res.status(404).json({ message: "inactive state is not found " });
    }
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};


exports.getStatebyid = async (req, res) => {
  try {
    const result = await statemodel.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "state is not found " });
    }
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};


exports.updateState = async (req, res) => {
    try{
        const { Statename } = req.body;
        if(!Statename){
            return res.status(400).json({message:"statename is required"});
        }
        const result = await statemodel.findByIdAndUpdate(req.params.id,{ Statename },{new:true});
        
        if(!result){
            return res.status(404).json({message:"state is not found"});
        }
        
        return res.status(200).json({result});
    }catch(err){
        return res.status(500).json({message:"server error occured"})
    }
}

exports.deleteState = async (req, res) => {
    try {
        const result = await statemodel.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "state is not found" });
        }
        return res.status(200).json({result});

    }catch(err){
        return res.status(500).json({message:"server error occured"})
    }
}

exports.softDeleteState = async (req, res) => {

    try{
        const {id} = req.params;
        const result = await statemodel.findByIdAndUpdate(id,{status:"inactive"},{new:true});
        if(!result){
            return res.status(404).json({message : "state not found" });
        }
        return res .status(200).json({result});
    }catch(err){
        return res.status(500).json({message:"server error occured"})
    }

    }

    
exports.restoreState = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await statemodel.findByIdAndUpdate(
      id,
      { status: "active" },
      { new: true },
    );
    if (!result) {
      return res.status(404).json({ message: "state not found" });
    }
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ message: "server error occured" });
  }
};

