const express = require("express");
const { instructorAuthorization } = require("../middleware/authentication");
const { upload } = require("../services/cloudinary.service");
const {
  addCourse,
  instructorCourses,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses.controller");
const Router = express.Router();

Router.post(
  "/instructor",
  instructorAuthorization,
  upload.array("files", 10),
  addCourse
);
Router.patch(
  "/instructor/:id",
  instructorAuthorization,
  upload.array("files", 10),
  updateCourse
);
Router.delete("/instructor/:id", instructorAuthorization, deleteCourse);
Router.get("/instructor", instructorAuthorization, instructorCourses);

module.exports = Router;
