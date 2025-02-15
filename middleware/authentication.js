const { Instructor } = require("../models/instructor.model");
const { jwtVerifier } = require("../utils/jwt.utils");

const instructorAuthorization = async (req, res, next) => {
  try {
    const { token } = req.headers;
    // console.log(token);
    if (!token) throw new Error("Unauthorized");

    const { email } = await jwtVerifier(token);
    // console.log("jwt: ", { email, tokenVersion });
    const instructor = await Instructor.findOne({
      email: email,
    });
    // console.log("user: ", user);

    if (!instructor) throw new Error("Unauthorized");
    req.instructor = instructor.toObject();
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: false,
      message: error.message || "Invalid or expired token",
    });
  }
};

const studentAuthorization = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) throw new Error("Unauthorized");

    const { email } = await jwtVerifier(token);
    const student = await Student.findOne({
      email: email,
    });

    if (!student) throw new Error("Unauthorized");
    req.student = student.toObject();
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: false,
      message: error.message || "Invalid or expired token",
    });
  }
};

module.exports = {
  instructorAuthorization,
  // studentAuthorization,
};
