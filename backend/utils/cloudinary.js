const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a multiple images to Cloudinary
 * @param {Array} files
 * @returns {Promise<Array>}
 */

const sharp = require("sharp");

exports.uploadImage = async (files) => {
  console.log(`>>>>>>files`, files);
  console.log("inside uploadImage");

  if (!files || Object.keys(files).length === 0) {
    throw new Error("Image is required");
}
const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

  let fileArray = Object.values(files).flat();
  const results = []; // This will store the result of each upload

  // Upload each file one by one
  
  for (const file of fileArray) {
    try {
        if (!allowedTypes.includes(file.mimetype)) {
                throw new Error(
                    `${file.name}: Only JPG, PNG and WEBP are allowed`
                );
            }
            if (file.size > 5 * 1024 * 1024) {
                throw new Error(
                    `${file.name}: Image must be less than 5 MB`
                );
            }

            // 3. Compress this particular image
            const compressedImage = await sharp(file.data)
                .resize({
                    width: 1200,
                    withoutEnlargement: true    //it means If the image is already smaller than 1200px, don't make it bigger.
                })
                .jpeg({
                    quality: 80
                })
                .toBuffer(); // it will give us final images as binary data in buffer format. We can use this buffer to upload to cloudinary.

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
          .end(compressedImage); // Start uploading the file
      });

      results.push(result); // Store the result of the upload
    } catch (error) {
      console.error("Error uploading file:", error); // Log the error if upload fails
    }
  }

  return results;
 
};

