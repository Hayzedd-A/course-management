const bcrypt = require("bcryptjs");

// Hash the password
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return [hashedPassword, salt];
  } catch (error) {
    return error;
  }
};

// compare password
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    return error;
  }
};

module.exports = { hashPassword, comparePassword };
