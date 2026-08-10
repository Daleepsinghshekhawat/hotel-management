const Coupon = require("../model/couponModel");
const Hotel = require("../model/hotelModel");
const HotelRequest = require("../model/hotelRequestModel");


exports.createCoupon = async (req, res) => {
  try {
    const {
      hotel,
      adminEmail,
      couponCode,
      discountType,
      discount,
      minimumBookingAmount,
      maximumDiscount,
      maxUsage,
      expiryDate,
    } = req.body;

    // Check required fields
    if (!couponCode || !discount || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Check hotel exists if provided
    if (hotel) {
      let hotelExists = await Hotel.findById(hotel);
      if (!hotelExists) {
        hotelExists = await HotelRequest.findById(hotel);
      }
      if (!hotelExists) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found.",
        });
      }
    }

    // Check duplicate coupon code
    const existingCoupon = await Coupon.findOne({
      couponCode: couponCode.toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists.",
      });
    }

  
    const coupon = await Coupon.create({
      hotel: hotel || null,
      adminEmail: adminEmail || null,
      couponCode,
      discountType,
      discount,
      minimumBookingAmount,
      maximumDiscount,
      maxUsage,
      expiryDate,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      coupon,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

  exports.getAllCoupons = async (req, res) => {
    try {
      const { search } = req.query;
      let query = {};
      if (search) {
        query.$or = [
          { couponCode: { $regex: search, $options: "i" } }
        ];
      }
  
      const couponsRaw = await Coupon.find(query).sort({ createdAt: -1 }).lean();

      // Manually populate hotel to support HotelRequest fallback
      for (let c of couponsRaw) {
        if (c.hotel) {
          let h = await Hotel.findById(c.hotel).select("hotelName ownerName").lean();
          if (!h) {
            h = await HotelRequest.findById(c.hotel).select("hotelName ownerName").lean();
          }
          c.hotel = h || null;
        }
      }
  
      return res.json({
        success: true,
        coupons: couponsRaw,
      });
    } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.getCouponsByAdmin = async (req, res) => {
  try {
    const adminEmail = req.params.email;
    
    // First find all hotels associated with this admin
    const adminHotels = await Hotel.find({ email: adminEmail });
    const hotelIds = adminHotels.map(h => h._id);

    const couponsRaw = await Coupon.find({
      $or: [
        { hotel: { $in: hotelIds } },
        { adminEmail: adminEmail }
      ]
    }).sort({ createdAt: -1 }).lean();

    // Manually populate hotel to support HotelRequest fallback
    for (let c of couponsRaw) {
      if (c.hotel) {
        let h = await Hotel.findById(c.hotel).select("hotelName ownerName").lean();
        if (!h) {
          h = await HotelRequest.findById(c.hotel).select("hotelName ownerName").lean();
        }
        c.hotel = h || null;
      }
    }

    return res.json({
      success: true,
      coupons: couponsRaw,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate(
      "hotel",
      "hotelname ownerName"
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    return res.json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    return res.json({
      success: true,
      message: "Coupon updated successfully.",
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.changeCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    coupon.status = req.body.status;

    await coupon.save();

    return res.json({
      success: true,
      message: "Coupon status updated successfully.",
      coupon,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};