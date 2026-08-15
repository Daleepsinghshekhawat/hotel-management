// We have removed nodemailer to bypass Render's SMTP block.
// Instead, we use the Brevo HTTP API (Port 443).

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.warn(" BREVO_API_KEY is not set in .env. Email will not be sent.");
      return { success: false, messageId: null };
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { 
          name: "Hotel Management", 
          email: process.env.EMAIL_USER || "no-reply@hotelmanagement.com" 
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(" Email FAILED via Brevo:", data);
      throw new Error(data.message || "Failed to send email via Brevo");
    }

    console.log(" Email sent to:", to, "| messageId:", data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (err) {
    console.log(" Email FAILED to send:", err.message);
    throw err; 
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

module.exports = { sendEmail, generateOTP };
