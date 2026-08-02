const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
{
    hotel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hotels",
        required:false
    },
    adminEmail:{
        type:String,
        required:false,
        trim:true
    },

    couponCode:{
        type:String,
        required:true,
        uppercase:true,
        trim:true,
        unique:true
    },

    discountType:{
        type:String,
        enum:["percentage","fixed"],
        default:"percentage"
    },

    discount:{
        type:Number,
        required:true
    },

    minimumBookingAmount:{
        type:Number,
        default:0
    },

    maximumDiscount:{
        type:Number,
        default:0
    },

    maxUsage:{
        type:Number,
        default:100
    },

    usedCount:{
        type:Number,
        default:0
    },

    expiryDate:{
        type:Date,
        required:true
    },

    status:{
        type:String,
        enum:["Active","Inactive","Expired"],
        default:"Active"
    }

},
{
timestamps:true
}
)

module.exports=mongoose.model("coupons",couponSchema);