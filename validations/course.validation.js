const Joi = require("joi");

const addCourse = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  document: Joi.string().optional(),
  videos: Joi.array().optional(),
  pdfs: Joi.array().optional(),
});

const updateCourse = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  document: Joi.string().optional(),
  videos: Joi.array().optional(),
  pdfs: Joi.array().optional(),
});

const courseValidator = {
  addCourse: (req) => addCourse.validate(req, { abortEarly: false }),
  updateCourse: (req) => updateCourse.validate(req, { abortEarly: false }),
};

module.exports = {
  courseValidator,
};
