const mongoose = require("mongoose");
const hotelModel = require("../model/hotelModel");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../utils/helper");
const { uploadImage } = require("../utils/cloudinary");
const userModel = require("../model/usermodel");
const hotelOwnerModel = require("../model/hotelOwnerModel");
const bcrypt = require("bcrypt");

const populateOptions = {
  path: "location",
  select: "cityname state district",
  populate: [
    { path: "state", select: "Statename" },
    { path: "district", select: "districtname" },
  ],
};

exports.submitHotelRequest = async (req, res) => {
  try {
    const {
      hotelName,
      ownerName,
      email,
      location,
      description,
      submittedBy,
      hotelType,
      amenities
    } = req.body;

    if (
      !hotelName ||
      !ownerName ||
      !email ||
      !location ||
      !description
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!req.files || (!req.files.image && !req.files.images)) {
      return res.status(400).json({
        message: "Hotel image is required",
      });
    }
    
    const imageFiles = req.files.images || req.files.image;

    const uploadResult = await uploadImage({
      image: imageFiles,
    });

    if (!uploadResult || uploadResult.length === 0) {
      return res.status(500).json({ message: "Image upload failed. Please check Cloudinary configuration." });
    }

    const imageUrls = uploadResult.map(res => res.secure_url);
    const registrationId = uuidv4();

    const hotel = await hotelModel.create({
      hotelName,
      ownerName,
      email,
      location,
      description,
      images: imageUrls,
      registrationId,
      submittedBy: submittedBy || email,
      hotelType: hotelType || "Hotel",
      status: "pending",
      amenities: amenities ? JSON.parse(amenities) : [],
    });

    await sendEmail({
      to: email,
      subject: "Hotel Registration Request Submitted",
      html: `
        <h2>Hotel Request Submitted Successfully</h2>
        <p>Hello ${ownerName},</p>
        <p>Your hotel request has been submitted and is pending superadmin approval.</p>
        <p><b>Registration ID:</b> ${registrationId}</p>
        <p>Status: Pending Approval</p>
        <br>
        <p>Thank You.</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Hotel request submitted successfully",
      registrationId,
      result: hotel,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.getAllHotelRequests = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let filter = {};
    if (search) {
      filter.$or = [
        { hotelName: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } }
      ];
    }

    let sortOption = {};
    if (sort === "a-z") sortOption.hotelName = 1;
    else if (sort === "z-a") sortOption.hotelName = -1;
    else if (sort === "oldest") sortOption.createdAt = 1;
    else sortOption.createdAt = -1;

    const result = await hotelModel
      .find(filter)
      .populate(populateOptions)
      .sort(sortOption);

    const filtered = result.filter((r) => r.status !== "inactive");

    return res.status(200).json({ result: filtered });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getPaginatedHotelRequests = async (req, res) => {
  try {
    const { search, sort, page = 1, limit = 10, status } = req.query;
    let filter = {};
    if (search) {
      filter.$or = [
        { hotelName: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } }
      ];
    }
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    let sortOption = {};
    if (sort === "a-z") sortOption.hotelName = 1;
    else if (sort === "z-a") sortOption.hotelName = -1;
    else if (sort === "oldest") sortOption.createdAt = 1;
    else sortOption.createdAt = -1;

    const result = await hotelModel
      .find(filter)
      .populate(populateOptions)
      .sort(sortOption);

    const filtered = result.filter(r => r.status !== "inactive");

    // Calculate counts ignoring the status tab
    const allRequestsForCounts = await hotelModel.find(search ? { $or: filter.$or } : {}).populate(populateOptions);
    const activeForCounts = allRequestsForCounts.filter(r => r.status !== "inactive");
    
    const counts = {
      pending: activeForCounts.filter(r => r.status === 'pending').length,
      approved: activeForCounts.filter(r => r.status === 'active').length,
      rejected: activeForCounts.filter(r => r.status === 'rejected').length
    };

    const totalDocuments = filtered.length;
    const totalPages = Math.ceil(totalDocuments / parseInt(limit));
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const paginatedResult = filtered.slice(skip, skip + parseInt(limit));

    return res.status(200).json({ 
      success: true, 
      result: paginatedResult,
      counts,
      pagination: {
        totalItems: totalDocuments,
        totalPages,
        currentPage: parseInt(page),
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) {
      return res.status(400).json({ message: "Status query parameter is required" });
    }
    const result = await hotelModel
      .find({ status })
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getRequestsByAdmin = async (req, res) => {
  try {
    const { email } = req.params;
    const { status } = req.query;

    const filter = { submittedBy: email };
    if (status && status !== "all") {
      filter.status = status;
    }

    const result = await hotelModel
      .find(filter)
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.approveRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    const request = await hotelModel.findById(id).session(session);

    if (!request) {
      return res.status(404).json({
        message: "Hotel request not found",
      });
    }

    if (request.status === "active") {
      return res.status(400).json({
        message: "Hotel request is already approved",
      });
    }
    request.role = "hotelOwner";
    request.status = "active";
    request.rejectionReason = "";
    await request.save({ session });

    // Find or Create in hotelowners collection
    let user = await hotelOwnerModel.findOne({ email: request.email }).session(session);
    let tempPassword = "";
    if (!user) {
      tempPassword = uuidv4().replace(/-/g, "").slice(0, 10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hashSync(tempPassword, salt);

      const userArr = await hotelOwnerModel.create([{
        name: request.ownerName,
        email: request.email,
        password: hashedPassword,
        role: "hotelOwner",
      }], { session });
      user = userArr[0];
      
      // Remove from normal users collection if they existed there, to avoid duplicate credentials
      await userModel.deleteOne({ email: request.email }, { session });
    } else {
      user.role = "hotelOwner";
      await user.save({ session });
    }

    try {
      let emailHtml = `
        <h2>Congratulations ${request.ownerName}</h2>
        <p>Your hotel <strong>${request.hotelName}</strong> has been approved by superadmin.</p>
        <p>You can now manage it from your hotel owner dashboard.</p>
        <p><strong>Registration ID:</strong> ${request.registrationId}</p>
      `;

      if (tempPassword) {
        emailHtml += `
          <p>A hotel owner account has been created for you. Log in using these credentials:</p>
          <p><strong>Email:</strong> ${request.email}</p>
          <p><strong>Password:</strong> ${tempPassword}</p>
          <p>Please change your password after logging in.</p>
        `;
      } else {
        emailHtml += `
          <p>Your existing account role has been updated to <strong>Hotel Owner</strong>. You can log in using your existing password.</p>
        `;
      }

      await sendEmail({
        to: request.email,
        subject: "Hotel Listing Approved & Account Created",
        html: emailHtml,
      });

      if (request.submittedBy && request.submittedBy !== request.email) {
        await sendEmail({
          to: request.submittedBy,
          subject: "Hotel Listing Approved",
          html: `
            <h2>Hotel Request Approved</h2>
            <p>The hotel <strong>${request.hotelName}</strong> has been approved by superadmin.</p>
            <p>An email has been sent to the owner (${request.email}) with login instructions.</p>
          `,
        });
      }
    } catch (emailErr) {
      console.log("Approval email failed:", emailErr.message);
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
      message: "Hotel approved successfully",
      result: request,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const request = await hotelModel.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Hotel request not found",
      });
    }

    request.status = "rejected";
    request.rejectionReason = rejectionReason;
    await request.save();

    try {
      await sendEmail({
        to: request.submittedBy,
        subject: "Hotel Listing Rejected",
        html: `
          <h2>Hello ${request.ownerName},</h2>
          <p>Your hotel listing request for <strong>${request.hotelName}</strong> has been rejected.</p>
          <p><strong>Reason:</strong> ${rejectionReason}</p>
          <p>You can fix the issues and submit your request again.</p>
        `,
      });
    } catch (emailErr) {
      console.log(emailErr.message);
    }

    return res.status(200).json({
      message: "Hotel request rejected successfully",
      result: request,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await hotelModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Hotel request not found",
      });
    }

    return res.status(200).json({
      message: "Hotel request deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.addHotelDirect = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      hotelName,
      ownerName,
      email,
      location,
      description,
      hotelType,
      amenities
    } = req.body;

    if (!hotelName || !ownerName || !email || !location || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.files || (!req.files.image && !req.files.images)) {
      return res.status(400).json({ message: "Hotel image is required" });
    }
    
    const imageFiles = req.files.images || req.files.image;

    const uploadResult = await uploadImage({
      image: imageFiles,
    });

    if (!uploadResult || uploadResult.length === 0) {
      return res.status(500).json({ success: false, message: "Image upload failed. Please check Cloudinary configuration." });
    }

    const imageUrls = uploadResult.map(res => res.secure_url);
    const registrationId = uuidv4();

    // 1. Create active hotel entry
    const hotelDataArr = await hotelModel.create([{
      hotelName,
      ownerName,
      email,
      location,
      description,
      images: imageUrls,
      registrationId,
      submittedBy: "superadmin",
      status: "active",
      hotelType: hotelType || "Hotel",
      amenities: amenities ? JSON.parse(amenities) : [],
    }], { session });
    const hotelData = hotelDataArr[0];

    // 3. Find or Create in hotelowners collection
    let user = await hotelOwnerModel.findOne({ email }).session(session);
    let tempPassword = "";
    if (!user) {
      tempPassword = uuidv4().replace(/-/g, "").slice(0, 10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hashSync(tempPassword, salt);

      const userArr = await hotelOwnerModel.create([{
        name: ownerName,
        email,
        password: hashedPassword,
        role: "hotelOwner",
      }], { session });
      user = userArr[0];
      
      // Remove from normal users collection if they existed there, to avoid duplicate credentials
      await userModel.deleteOne({ email }, { session });
    } else {
      user.role = "hotelOwner";
      await user.save({ session });
    }

    // 4. Send email notification
    let emailHtml = `
      <h2>Congratulations ${ownerName}!</h2>
      <p>Your hotel <strong>${hotelName}</strong> has been registered and approved directly by the SuperAdmin.</p>
    `;

    if (tempPassword) {
      emailHtml += `
        <p>A hotel owner account has been created for you. Log in using these credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${tempPassword}</p>
        <p>Please change your password after logging in.</p>
      `;
    } else {
      emailHtml += `
        <p>Your existing account role has been updated to <strong>Hotel Owner</strong>. You can log in using your existing password.</p>
      `;
    }

    try {
      await sendEmail({
        to: email,
        subject: "Hotel Registered and Approved Directly",
        html: emailHtml,
      });
    } catch (emailErr) {
      console.log("Failed to send direct registration email:", emailErr.message);
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({
      success: true,
      message: "Hotel added directly and approved successfully",
      result: hotelData,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};
