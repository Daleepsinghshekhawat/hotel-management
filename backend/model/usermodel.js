const mongoose  = require("mongoose");


const userSchema = new mongoose.Schema(
    {
        name:String,
        email:{
            type:String,
            unique:true,
            required:true
        },
        password:{
            type:String,
            required:true
        },

        role:{
            type:String,
            default:"user",
        },
        otp:String,
        otpExpiry:Date,
    },{
    timestamps :true,
    versionKey:false,
    },
);

module.exports = mongoose.model("users",userSchema);