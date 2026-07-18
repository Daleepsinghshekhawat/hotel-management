
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password — no spaces
  },
});

// Verify connection at startup — check your server console for this message
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email transporter FAILED:", error.message);
    console.log("   → Check EMAIL_USER and EMAIL_PASS in your .env file");
    console.log("   → Make sure you are using a Gmail App Password (not your account password)");
    console.log("   → App Password: https://myaccount.google.com/apppasswords");
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// sendEmail — now throws error so callers know if it failed
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Hotel Management" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent to:", to, "| messageId:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.log("❌ Email FAILED to send:", err.message);
    throw err; // Re-throw so the controller can log it
  }
};

const generateOTP = (length) => {
  if (!length || length <= 0) {
    throw new Error("length of otp cant be 0");
  }

  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

module.exports = { transporter, sendEmail, generateOTP };
