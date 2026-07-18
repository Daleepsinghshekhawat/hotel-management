const hotelRequest = require("../model/hotelRequestModel");
const hotelModel = require("../model/hotelModel");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../utils/helper");
const { uploadImage } = require("../utils/cloudinary");

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

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        message: "Hotel image is required",
      });
    }

    const uploadResult = await uploadImage({
      image: req.files.image,
    });

    const imageUrl = uploadResult[0].secure_url;
    const registrationId = uuidv4();

    const hotel = await hotelRequest.create({
      hotelName,
      ownerName,
      email,
      location,
      description,
      image: imageUrl,
      registrationId,
      submittedBy: submittedBy || email,
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
    const result = await hotelRequest
      .find()
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

exports.getRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const result = await hotelRequest
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

    const result = await hotelRequest
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
  try {
    const { id } = req.params;

    const request = await hotelRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Hotel request not found",
      });
    }

    if (request.status === "approved") {
      return res.status(400).json({
        message: "Hotel request is already approved",
      });
    }

    request.status = "approved";
    request.rejectionReason = "";
    await request.save();

    const existingHotel = await hotelModel.findOne({
      registrationId: request.registrationId,
    });

    if (!existingHotel) {
      await hotelModel.create({
        hotelName: request.hotelName,
        ownerName: request.ownerName,
        email: request.email,
        location: request.location,
        description: request.description,
        image: request.image,
        registrationId: request.registrationId,
        submittedBy: request.submittedBy,
        requestId: request._id,
        status: "active",
      });
    }

    try {
      await sendEmail({
        to: request.submittedBy,
        subject: "Hotel Listing Approved",
        html: `
          <h2>Congratulations ${request.ownerName}</h2>
          <p>Your hotel <strong>${request.hotelName}</strong> has been approved by superadmin.</p>
          <p>You can now manage it from your admin dashboard.</p>
          <p><strong>Registration ID:</strong> ${request.registrationId}</p>
        `,
      });
    } catch (emailErr) {
      console.log(emailErr.message);
    }

    return res.status(200).json({
      message: "Hotel approved successfully",
      result: request,
    });
  } catch (err) {
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

    const request = await hotelRequest.findById(id);

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

    const deleted = await hotelRequest.findByIdAndDelete(id);

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
