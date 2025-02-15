const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const fs = require("fs/promises");

cloudinary.config({
  sign_url: process.env.CLOUDINARY_URL,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Replace with your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // Replace with your Cloudinary API key
  api_secret: process.env.CLOUDINARY_SECRET_KEY, // Replace with your Cloudinary API secret
});

// Set up Cloudinary storage for multer
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "errandBuffer", // Specify a folder in Cloudinary
//     allowed_formats: ["jpg", "png", "jpeg"], // Restrict file types
//   },
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/"); // Temporary folder for storing files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

// Initialize multer with the Cloudinary storage
const upload = multer({ storage });

const uploadFiles = async (folder, files, resourceType) => {
  try {
    return await Promise.all(
      files.map(async (file) => {
        // Upload the file to Cloudinary with optimizations
        const result = await cloudinary.uploader.upload(file.path, {
          folder, // Organize in a folder on Cloudinary
          resource_type: resourceType,
          transformation:
            resourceType === "video"
              ? [{ quality: "auto", width: 1280, height: 720, crop: "limit" }]
              : [{ quality: "auto" }], // Apply transformations for video & PDFs
        });

        return {
          public_id: result.public_id.split("/")[1], // Store this if you want to delete it later
          url: result?.secure_url,
        };
      })
    );
  } catch (error) {
    throw error;
  }
};

const deleteTempFile = async (filePath) => {
  console.log("deleteTempFile: ", filePath);
  try {
    await fs.access(filePath); // Check if file exists
    await fs.unlink(filePath); // Delete file
    console.log("Temp file deleted successfully.");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("Temp file does not exist.");
    } else {
      console.error("Error deleting temp file:", err);
    }
  }
};

module.exports = { cloudinary, upload, deleteTempFile, uploadFiles };
