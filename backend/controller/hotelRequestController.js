const hotelRequestModel = require("../model/hotelRequestModel");
const userModel = require("../model/usermodel");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/helper");
const { uploadImage, pingCloudinary } = require("../utils/cloudinary");

// ─── Helper: generate a random password ──────────────────────────────────────
function generateRandomPassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

// ─── Submit a new hotel listing request (public) ──────────────────────────────
exports.submitRequest = async (req, res) => {
  try {
    const { ownerName, ownerEmail, ownerPhone, hotelName, description, place, images, facilities } =
      req.body;

    if (!ownerName || !ownerEmail || !hotelName || !place) {
      return res.status(400).json({
        message: "ownerName, ownerEmail, hotelName and place are required",
      });
    }

    // ── Upload images to Cloudinary and get permanent URLs ────────────────────
    let cloudinaryUrls = [];
    let uploadErrors = [];

    if (images && images.length > 0) {
      console.log(`[Cloudinary] Attempting to upload ${images.length} image(s)...`);

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        try {
          if (img.startsWith("data:")) {
            // base64 string → upload to Cloudinary
            const url = await uploadImage(img, "hotel_listings");
            cloudinaryUrls.push(url);
            console.log(`[Cloudinary] ✅ Image ${i + 1} uploaded: ${url}`);
          } else if (img.startsWith("blob:")) {
            // blob: URLs cannot be resolved server-side, skip
            console.log(`[Cloudinary] ⚠️  Image ${i + 1} is a blob URL (skipped — cannot upload server-side)`);
          } else {
            // Already a valid Cloudinary/HTTP URL — keep as-is
            cloudinaryUrls.push(img);
            console.log(`[Cloudinary] ℹ️  Image ${i + 1} is already a URL, kept as-is`);
          }
        } catch (uploadErr) {
          console.error(`[Cloudinary] ❌ Image ${i + 1} upload FAILED:`, uploadErr.message);
          uploadErrors.push(uploadErr.message);
        }
      }

      // If every single image failed to upload, reject the request so the
      // user knows something is wrong (bad credentials, size limit, etc.)
      if (cloudinaryUrls.length === 0 && uploadErrors.length > 0) {
        return res.status(500).json({
          message: "All image uploads to Cloudinary failed. Check your CLOUDINARY_* credentials in .env.",
          errors: uploadErrors,
        });
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const result = await hotelRequestModel.create({
      ownerName,
      ownerEmail,
      ownerPhone,
      hotelName,
      description,
      place,
      images: cloudinaryUrls,
      facilities: facilities || [],
    });

    // Send acknowledgement email to the owner
    try {
      await sendEmail({
        to: ownerEmail,
        subject: "🏨 Your Hotel Listing Request Has Been Received!",
        html: `
          <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;background:#f4f4f4;padding:30px;">
            <div style="background:#2563eb;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
              <h1 style="color:white;margin:0;">Request Received!</h1>
            </div>
            <div style="background:white;padding:30px;border-radius:0 0 10px 10px;">
              <h2>Hello ${ownerName} 👋</h2>
              <p style="font-size:16px;color:#555;line-height:1.7;">
                Thank you for submitting your hotel listing request for
                <strong>${hotelName}</strong>.
              </p>
              <p style="font-size:16px;color:#555;line-height:1.7;">
                Our team will review your application and get back to you shortly.
                You will receive an email once a decision has been made.
              </p>
              <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0;font-size:14px;color:#64748b;"><strong>Hotel Name:</strong> ${hotelName}</p>
                <p style="margin:8px 0 0;font-size:14px;color:#64748b;"><strong>Location:</strong> ${place}</p>
                <p style="margin:8px 0 0;font-size:14px;color:#64748b;"><strong>Status:</strong> Under Review</p>
              </div>
              <hr style="border:none;border-top:1px solid #ddd;">
              <p style="color:#888;font-size:14px;">
                If you did not submit this request, please ignore this email.
              </p>
              <p style="margin-top:20px;">Regards,<br><strong>Hotel Management Team</strong></p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.log("Acknowledgement email failed:", emailErr.message);
    }

    return res.status(200).json({
      message: "Hotel listing request submitted successfully",
      result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

// ─── Get all hotel requests (SuperAdmin) ──────────────────────────────────────
exports.getAllRequests = async (req, res) => {
  try {
    const result = await hotelRequestModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

// ─── Get requests by status ───────────────────────────────────────────────────
exports.getRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const result = await hotelRequestModel.find({ status }).sort({ createdAt: -1 });
    return res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

// ─── Approve a hotel request ──────────────────────────────────────────────────
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await hotelRequestModel.findByIdAndUpdate(
      id,
      { status: "approved", rejectionReason: "" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // ── Auto-create a user account for the hotel owner ────────────────────────
    const plainPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    let existingUser = await userModel.findOne({ email: request.ownerEmail });
    if (!existingUser) {
      await userModel.create({
        name: request.ownerName,
        email: request.ownerEmail,
        password: hashedPassword,
        role: "admin",
      });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Send approval email with credentials to owner
    try {
      await sendEmail({
        to: request.ownerEmail,
        subject: "🎉 Your Hotel Listing Has Been Approved! – Login Credentials Inside",
        html: `
          <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;background:#f4f4f4;padding:30px;">
            <div style="background:#16a34a;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
              <h1 style="color:white;margin:0;">✅ Approved!</h1>
            </div>
            <div style="background:white;padding:30px;border-radius:0 0 10px 10px;">
              <h2>Congratulations, ${request.ownerName}! 🎊</h2>
              <p style="font-size:16px;color:#555;line-height:1.7;">
                We are pleased to inform you that your hotel listing request for
                <strong>${request.hotelName}</strong> has been
                <strong style="color:#16a34a;">approved</strong>.
              </p>
              <p style="font-size:16px;color:#555;line-height:1.7;">
                Your hotel is now officially listed on our platform.
                Use the credentials below to log in to your hotel admin panel.
              </p>

              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:20px 0;">
                <p style="margin:0 0 8px;font-size:15px;color:#166534;font-weight:700;">🔑 Your Login Credentials</p>
                <p style="margin:6px 0;font-size:14px;color:#166534;">
                  <strong>Login URL:</strong>
                  <a href="http://localhost:5173/login" style="color:#2563eb;">http://localhost:5173/login</a>
                </p>
                <p style="margin:6px 0;font-size:14px;color:#166534;">
                  <strong>Email:</strong> ${request.ownerEmail}
                </p>
                <p style="margin:6px 0;font-size:14px;color:#166534;">
                  <strong>Password:</strong>
                  <span style="background:#dcfce7;padding:2px 8px;border-radius:4px;font-family:monospace;font-size:15px;">
                    ${existingUser ? "(your existing password)" : plainPassword}
                  </span>
                </p>
                ${!existingUser ? `<p style="margin:12px 0 0;font-size:12px;color:#4ade80;">⚠️ Please change your password after first login for security.</p>` : ""}
              </div>

              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;">
                <p style="margin:0;font-size:14px;color:#1e40af;"><strong>Hotel Name:</strong> ${request.hotelName}</p>
                <p style="margin:8px 0 0;font-size:14px;color:#1e40af;"><strong>Location:</strong> ${request.place}</p>
                <p style="margin:8px 0 0;font-size:14px;color:#1e40af;"><strong>Status:</strong> ✅ Approved &amp; Live</p>
              </div>

              <hr style="border:none;border-top:1px solid #ddd;">
              <p style="color:#888;font-size:13px;">
                If you did not submit this request, please contact our support team immediately.
              </p>
              <p style="margin-top:20px;">Regards,<br><strong>Hotel Management Team</strong></p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.log("Approval email failed:", emailErr.message);
    }

    return res.status(200).json({
      message: "Request approved and email sent to owner",
      result: request,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

// ─── Reject a hotel request ───────────────────────────────────────────────────
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const request = await hotelRequestModel.findByIdAndUpdate(
      id,
      { status: "rejected", rejectionReason: rejectionReason.trim() },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Send rejection email to owner
    try {
      await sendEmail({
        to: request.ownerEmail,
        subject: "❌ Update on Your Hotel Listing Request",
        html: `
          <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;background:#f4f4f4;padding:30px;">
            <div style="background:#dc2626;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
              <h1 style="color:white;margin:0;">Listing Not Approved</h1>
            </div>
            <div style="background:white;padding:30px;border-radius:0 0 10px 10px;">
              <h2>Dear ${request.ownerName},</h2>
              <p style="font-size:16px;color:#555;line-height:1.7;">
                Thank you for your interest in listing <strong>${request.hotelName}</strong> on our platform.
              </p>
              <p style="font-size:16px;color:#555;line-height:1.7;">
                After careful review, we regret to inform you that your hotel listing request has
                <strong style="color:#dc2626;">not been approved</strong> at this time.
              </p>
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0;">
                <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">Reason for Rejection:</p>
                <p style="margin:8px 0 0;font-size:15px;color:#7f1d1d;line-height:1.6;">${rejectionReason}</p>
              </div>
              <p style="font-size:15px;color:#555;line-height:1.7;">
                You are welcome to address the issues mentioned above and resubmit your request.
                We encourage you to make the necessary improvements and apply again.
              </p>
              <hr style="border:none;border-top:1px solid #ddd;">
              <p style="color:#888;font-size:14px;">
                If you have any questions, feel free to contact our support team.
              </p>
              <p style="margin-top:20px;">Regards,<br><strong>Hotel Management Team</strong></p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.log("Rejection email failed:", emailErr.message);
    }

    return res.status(200).json({
      message: "Request rejected and email sent to owner",
      result: request,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

// ─── Test Cloudinary credentials (GET /api/testCloudinary) ───────────────────
// Hit this endpoint to verify your CLOUDINARY_* .env keys are correct.
// Returns 200 with ping details on success, 500 with the error on failure.
exports.testCloudinary = async (req, res) => {
  try {
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      // Never expose the secret in the response
    };

    // Validate that placeholders haven't been left in .env
    if (
      !config.cloud_name ||
      config.cloud_name === "your_cloud_name_here" ||
      !process.env.CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY === "your_api_key_here" ||
      !process.env.CLOUDINARY_API_SECRET ||
      process.env.CLOUDINARY_API_SECRET === "your_api_secret_here"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cloudinary credentials are still set to placeholder values. " +
          "Open backend/.env and fill in your real CLOUDINARY_CLOUD_NAME, " +
          "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
        configured: config,
      });
    }

    const pingResult = await pingCloudinary();
    console.log("[Cloudinary] ✅ Ping successful:", pingResult);

    return res.status(200).json({
      success: true,
      message: "✅ Cloudinary is working correctly!",
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      ping: pingResult,
    });
  } catch (err) {
    console.error("[Cloudinary] ❌ Ping failed:", err.message);
    return res.status(500).json({
      success: false,
      message: "❌ Cloudinary ping failed. Your credentials may be wrong.",
      error: err.message,
    });
  }
};

// ─── Update images for an existing hotel request (PATCH /api/updateHotelImages/:id) ──
// Used to fix old requests that were saved with images:[] because Cloudinary wasn't set up.
// SuperAdmin can upload new base64 images and they'll be pushed to Cloudinary + saved to MongoDB.
exports.updateHotelImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body; // array of base64 strings

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "Please provide at least one image (base64)" });
    }

    const request = await hotelRequestModel.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Hotel request not found" });
    }

    console.log(`[Cloudinary] Uploading ${images.length} image(s) for request ${id}...`);

    const cloudinaryUrls = [];
    const errors = [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        if (img.startsWith("data:")) {
          const url = await uploadImage(img, "hotel_listings");
          cloudinaryUrls.push(url);
          console.log(`[Cloudinary] ✅ Image ${i + 1} uploaded: ${url}`);
        } else if (!img.startsWith("blob:")) {
          // Already a valid URL — keep as-is
          cloudinaryUrls.push(img);
        }
      } catch (uploadErr) {
        console.error(`[Cloudinary] ❌ Image ${i + 1} failed:`, uploadErr.message);
        errors.push(uploadErr.message);
      }
    }

    if (cloudinaryUrls.length === 0) {
      return res.status(500).json({
        message: "All image uploads failed. Check your Cloudinary credentials.",
        errors,
      });
    }

    // Replace (or append) images on the document
    const updated = await hotelRequestModel.findByIdAndUpdate(
      id,
      { images: cloudinaryUrls },
      { new: true }
    );

    return res.status(200).json({
      message: `✅ ${cloudinaryUrls.length} image(s) uploaded and saved successfully`,
      images: cloudinaryUrls,
      result: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error occurred" });
  }
};

// ─── Delete a hotel request (DELETE /api/deleteHotelRequest/:id) ──────────────
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await hotelRequestModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Request not found" });
    }
    return res.status(200).json({ message: "Hotel request deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error occurred" });
  }
};
