require('dotenv').config();
const { sendEmail } = require('./utils/helper');

async function test() {
  console.log("Checking environment variables...");
  if (!process.env.EMAIL_USER) {
    console.error("❌ EMAIL_USER is not set in .env");
    process.exit(1);
  }
  if (!process.env.EMAIL_PASS) {
    console.error("❌ EMAIL_PASS is not set in .env");
    process.exit(1);
  }

  console.log(`Sending test email to ${process.env.EMAIL_USER}...`);
  try {
    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: "Test Email from Nodemailer (Port 465)",
      html: "<h1>It Works!</h1><p>Your Nodemailer configuration is successful and using port 465.</p>"
    });
    console.log("Test result:", result);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

test();
