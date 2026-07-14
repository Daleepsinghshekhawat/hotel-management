const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
    {
        cityname:String,
        district:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"districts"
        },
        status:{
            type:String,
            default:"active"
        }
    },
    {
        timestamps:true,
        versionKey:false,
    }
)

module.exports = mongoose.model("cities",citySchema);
