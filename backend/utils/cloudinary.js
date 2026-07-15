const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Ping Cloudinary to verify that the credentials in .env are correct.
 * @returns {Promise<object>} - Cloudinary ping response
 */
const pingCloudinary = async () => {
  return await cloudinary.api.ping();
};

/**
 * Upload a base64 image string to Cloudinary
 * @param {string} base64String  - "data:image/jpeg;base64,/9j/4AAQ..."
 * @param {string} folder        - Cloudinary folder name
 * @returns {Promise<string>}    - secure URL of the uploaded image
 */
const uploadImage = async (base64String, folder = "hotel_listings") => {
  const result = await cloudinary.uploader.upload(base64String, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
};

module.exports = { cloudinary, uploadImage, pingCloudinary };
