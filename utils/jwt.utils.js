const jwt = require("jsonwebtoken");
const TOKENEXPIRATION = "7d";

const jwtSigner = (email) =>
  new Promise((res, rej) => {
    jwt.sign(
      { email: email },
      process.env.JWT_PRIVATE_KEY,
      { expiresIn: TOKENEXPIRATION },
      function (err, token) {
        if (err) rej(err);
        else res(token);
      }
    );
  });

const jwtVerifier = (token) => {
  return new Promise((res, rej) => {
    jwt.verify(token, process.env.JWT_PRIVATE_KEY, function (err, decoded) {
      if (err) rej(err);
      else res(decoded);
    });
  });
};

module.exports = { jwtSigner, jwtVerifier };
