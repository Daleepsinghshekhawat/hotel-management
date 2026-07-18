const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a single image to Cloudinary
 * @param {string} filePath
 * @param {string} folder
 * @returns {Promise<string>}
 */
exports.uploadImage = async (files) => {
  console.log(`>>>>>>files`, files);
  console.log("inside uploadImage");

  const fileArray = Object.values(files); // Convert files object to an array
  const results = []; // This will store the result of each upload

  // Upload each file one by one
  
  for (const file of fileArray) {
    try {
      const result = await new Promise((resolve, reject) => {
        // Upload the file to Cloudinary
        cloudinary.uploader
          .upload_stream((error, result) => {
            console.log(`>>>>>>>>>>>error, result`, error, result);

            if (error) {
              reject(error); // Reject if there's an error
            } else {
              resolve(result); // Resolve with the result if upload is successful
            }
          })
          .end(file.data); // Start uploading the file
      });

      results.push(result); // Store the result of the upload
    } catch (error) {
      console.error("Error uploading file:", error); // Log the error if upload fails
    }
  }

  return results;
 
};

