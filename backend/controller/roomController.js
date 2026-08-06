const mongoose = require("mongoose");
const Room = require("../model/room");

const Hotel = require("../model/hotelModel");
const { uploadImage } = require("../utils/cloudinary");


// Add Room


exports.addRoom = async (req, res) => {
  try {
    const {
      hotel,
      roomName,
      roomNumber,
      floor,
      roomType,
      description,

      roomSize,

      adults,
      children,
      maxGuests,

      beds,
      bedType,

      price,
      discount,
      tax,
      weekendPrice,
      festivalPrice,
      extraBedPrice,

      totalRooms,
      availableRooms,

      bookingStatus,

      roomView,

      rating,
      totalReviews,

      featured,
      status,

      wifi,
      ac,
      heater,
      fan,

      smartTV,
      ott,
      telephone,

      refrigerator,
      microwave,
      kettle,
      coffeeMachine,

      wardrobe,
      workDesk,
      sofa,
      diningTable,

      iron,
      locker,

      attachedBathroom,
      bathtub,
      shower,
      hotWater,
      toiletries,
      hairDryer,

      balcony,

      breakfast,
      lunch,
      dinner,

      roomService,
      laundry,
      housekeeping,
      wakeupCall,
      newspaper,

      parking,
      swimmingPool,
      gym,
      spa,
      restaurant,
      bar,

      wheelchair,
      lift,

      smokeDetector,
      fireExtinguisher,
      cctv,
      electronicLock,

      smoking,
      pets,
      coupleFriendly,
      localIdAccepted,
      refundable,
      instantBooking,
    } = req.body;

  
    // Validation
   

    if (!hotel || !roomName || !roomNumber || !roomType || !price) {
      return res.json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    
    // Check Hotel Exists
   

    let hotelExists = null;
    if (mongoose.Types.ObjectId.isValid(hotel)) {
      hotelExists = await Hotel.findById(hotel);
      if (!hotelExists) {
        hotelExists = await Hotel.findOne({ requestId: hotel });
      }
    }

    if (!hotelExists) {
      return res.json({
        success: false,
        message: "Hotel not found",
      });
    }

    const actualHotelId = hotelExists._id;

   
    // Duplicate Room Number
   

    const roomExists = await Room.findOne({
      hotel: actualHotelId,
      roomNumber,
    });

    if (roomExists) {
      return res.json({
        success: false,
        message: "Room Number already exists.",
      });
    }

   
    // Upload Images
   

    let imageUrls = [];

    if (req.files) {
      const uploadedImages = await uploadImage(req.files);

      imageUrls = uploadedImages.map((img) => img.secure_url);
    }


    // Calculate Price
  

    const finalPrice =
      Number(price) -
      (Number(price) * Number(discount || 0)) / 100;

  
    // Save
   

    const room = await Room.create({
      hotel: actualHotelId,

      roomName,
      roomNumber,
      floor,
      roomType,
      description,

      roomSize,

      adults,
      children,
      maxGuests,

      beds,
      bedType: bedType || undefined,

      price,
      discount,
      finalPrice,
      tax,
      weekendPrice,
      festivalPrice,
      extraBedPrice,

      totalRooms,
      availableRooms,

      bookingStatus,

      images: imageUrls,

      wifi,
      ac,
      heater,
      fan,

      smartTV,
      ott,
      telephone,

      refrigerator,
      microwave,
      kettle,
      coffeeMachine,

      wardrobe,
      workDesk,
      sofa,
      diningTable,

      iron,
      locker,

      attachedBathroom,
      bathtub,
      shower,
      hotWater,
      toiletries,
      hairDryer,

      balcony,
      roomView: roomView || undefined,

      breakfast,
      lunch,
      dinner,

      roomService,
      laundry,
      housekeeping,
      wakeupCall,
      newspaper,

      parking,
      swimmingPool,
      gym,
      spa,
      restaurant,
      bar,

      wheelchair,
      lift,

      smokeDetector,
      fireExtinguisher,
      cctv,
      electronicLock,

      smoking,
      pets,
      coupleFriendly,
      localIdAccepted,
      refundable,
      instantBooking,

      rating,
      totalReviews,

      featured,
      status,
    });

    return res.json({
      success: true,
      message: "Room Added Successfully",
      result: room,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: "Server Error",
    });
  }
};


// Get Rooms By Hotel


exports.getRoomsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { search, sort } = req.query;

    let actualHotelId = hotelId;
    if (mongoose.Types.ObjectId.isValid(hotelId)) {
      const activeHotel = await Hotel.findOne({
        $or: [{ _id: hotelId }, { requestId: hotelId }],
      });
      if (activeHotel) {
        actualHotelId = activeHotel._id;
      }
    }

    let filter = {
      hotel: actualHotelId,
      status: true,
    };

    if (search) {
      filter.$or = [
        {
          roomName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          roomType: {
            $regex: search,
            $options: "i",
          },
        },
        {
          bedType: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    let sortOption = {};
    if (sort === "lowPrice") {
      sortOption.price = 1;
    } else if (sort === "highPrice") {
      sortOption.price = -1;
    } else if (sort === "a-z") {
      sortOption.roomName = 1;
    } else if (sort === "z-a") {
      sortOption.roomName = -1;
    } else if (sort === "newest") {
      sortOption.createdAt = -1;
    } else if (sort === "oldest") {
      sortOption.createdAt = 1;
    } else {
      sortOption.createdAt = -1; // Default
    }

    const rooms = await Room.find(filter).sort(sortOption);

    res.json({
      success: true,
      total: rooms.length,
      result: rooms,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Unable to fetch rooms",
    });
  }
};

// Get Single Room

exports.getSingleRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("hotel");

    if (!room) {
      return res.json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      result: room,
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: "Server Error",
    });

  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.json({
        success: false,
        message: "Room Not Found",
      });
    }

    // 👇 Put it here
    if (room.bookingStatus === "Booked") {
      return res.json({
        success: false,
        message: "Cannot delete a booked room.",
      });
    }

    room.status = false;

    await room.save();

    return res.json({
      success: true,
      message: "Room Deleted Successfully",
    });

  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: error.message,
    });
  }
};


//update room

exports.updateRoom=async(req,res)=>{

try{

const room=await Room.findById(req.params.id);

if(!room){

return res.json({

success:false,

message:"Room Not Found"

});

}

let imageUrls=room.images;

if(req.files){

const uploaded=await uploadImage(req.files);

imageUrls=uploaded.map(img=>img.secure_url);

}

const finalPrice=

Number(req.body.price)-

(

Number(req.body.price)*

Number(req.body.discount||0)/100

);

const updated=await Room.findByIdAndUpdate(

req.params.id,

{

...req.body,

images:imageUrls,

finalPrice

},

{

new:true

}

);

res.json({

success:true,

message:"Room Updated",

result:updated

});

}

catch(error){

console.log(error);

res.json({

success:false,

message:"Server Error"

});

}

}