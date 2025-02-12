const errorHandler = (err, req, res, next) => {
  // console.error(err);

  // Default status and message
  const status = err.status || 500; // Default to 500 Internal Server Error
  const response = {
    success: false,
    message: err.message || "An unexpected error occurred",
  };

  // Handle Joi Validation Errors
  if (err.type === "validation") {
  }
  response.errors = err.details; // Include validation details

  // Handle Mongoose UniqueValidator Errors
  console.log(response);
  // Send the structured response
  res.status(status).json(response);
};

module.exports = errorHandler;
