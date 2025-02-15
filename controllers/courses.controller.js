const { Course } = require("../models/course.model");
const { uploadFiles, cloudinary } = require("../services/cloudinary.service");
const { joiException } = require("../utils/functions.utils");
const { courseValidator } = require("../validations/course.validation");
const fs = require("fs/promises");

const addCourse = async (req, res, next) => {
  try {
    const { instructor } = req;
    const { error } = courseValidator.addCourse(req.body);
    if (error) throw joiException(error);
    const { title, description, document } = req.body;
    const files = req.files;
    if (files.length > 0) {
      console.log(files);
      // Extract uploaded file paths

      const videos = files.filter((file) => file.mimetype.includes("video"));
      const pdfs = files.filter((file) => file.mimetype.includes("pdf"));
      console.log({ videos: videos, pdfs: pdfs });
      // Upload files to Cloudinary
      const videoResults = await uploadFiles("videos", videos, "video");
      console.log({ videoResults });
      const pdfResults = await uploadFiles("pdfs", pdfs, "raw");
      console.log({ pdfResults });

      // Add video and PDF paths to the course object
      req.body.videos = videoResults.map((result) => result.url);
      req.body.pdfs = pdfResults.map((result) => result.url);
    } else {
      req.body.videos = [];
      req.body.pdfs = [];
    }
    // Create a new course document in the database
    const newCourse = new Course({
      title: title,
      description,
      instructor: instructor._id,
      document,
      videos: req.body.videos,
      pdfs: req.body.pdfs,
    });
    await newCourse.save();
    res.status(200).json({
      success: true,
      message: "Course added successfully",
      data: newCourse,
    });
  } catch (err) {
    console.error(err);
    next(err);
  } finally {
    if (req.files)
      Promise.all(req.files.map(async (file) => fs.unlink(file.path)));
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { instructor } = req;
    const { error } = courseValidator.updateCourse(req.body);
    if (error) throw joiException(error);
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) throw new Error("Course not found", 404);
    if (course.instructor.toString() !== instructor._id.toString()) {
      throw new Error("Unauthorized", 401);
    }
    const { title, description, document } = req.body;
    const files = req.files;
    if (files && files?.length > 0) {
      const videos = files.filter((file) => file.mimetype.includes("video"));
      const pdfs = files.filter((file) => file.mimetype.includes("pdf"));
      console.log({ videos: videos, pdfs: pdfs });
      const videoResults = await uploadFiles("videos", videos, "video");
      const pdfResults = await uploadFiles("pdfs", pdfs, "raw");
      req.body.videos = videoResults.map((result) => result.url);
      req.body.pdfs = pdfResults.map((result) => result.url);
    } else {
      req.body.videos = course.videos;
      req.body.pdfs = course.pdfs;
    }
    course.title = title || course.title;
    course.description = description || course.description;
    course.document = document || course.document;
    course.videos.push(...req.body.videos);
    course.pdfs.push(...req.body.pdfs);
    await course.save();
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    next(error);
  } finally {
    if (req.files) {
      Promise.all(req?.files?.map(async (file) => fs.unlink(file.path)));
    }
  }
};

// instructor gets all his courses
const instructorCourses = async (req, res, next) => {
  try {
    const { instructor } = req;
    const courses = await Course.find({ instructor: instructor._id });
    res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { instructor } = req;
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) throw new Error("Course not found", 404);
    if (course.instructor.toString() !== instructor._id.toString()) {
      throw new Error("Unauthorized", 401);
    }
    if (course.videos.length > 0) {
      console.log(course.videos);
      let imageKeys = course.videos.map((item) => {
        console.log(item);
        let key = item.split("/videos/")[1].split(".")[0];
        return `videos/${key}`;
      });
      let response = await cloudinary.api.delete_resources(imageKeys, {
        type: "upload",
        resource_type: "video",
      });
      console.log(response);
    }
    if (course.pdfs.length > 0) {
      console.log(course.pdfs);
      let imageKeys = course.pdfs.map((item) => {
        let key = item.split("/pdfs/")[1].split(".")[0];
        return `pdfs/${key}`;
      });
      let response = await cloudinary.api.delete_resources(imageKeys, {
        type: "upload",
        resource_type: "raw",
      });
      console.log(response);
    }
    await Course.deleteOne({ _id: id });
    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { addCourse, instructorCourses, updateCourse, deleteCourse };
