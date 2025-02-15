const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Reference to instructor
  videos: [{ type: String }], // Array of video links
  pdfs: [{ type: String }], // Array of PDF links
  createdAt: { type: Date, default: Date.now },
});

const Course = mongoose.model("Course", courseSchema);
module.exports = { Course };
