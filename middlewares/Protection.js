const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const userModel = require("../models/userModel"); // Adjust the path if necessary

// Middleware to protect routes
const protectionMW = async (req, res, next) => {
  try {
    let token;

    // 1) Check if the user is logged in and has provided a token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You must be logged in to access this resource!",
      });
    }

    // 2) Verify if the token is valid
    const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if the user exists in the database
    const user = await userModel.findById(decodedToken.id);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "The user associated with this token no longer exists!",
      });
    }

    // 4) Check if the token was issued before the user's password was changed
    if (user.validTokenDate(decodedToken.iat)) {
      return res.status(401).json({
        status: "fail",
        message: "Token is no longer valid!",
      });
    }

    // Attach the user to the request object for access in the next middleware/controller
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message || "Authentication failed!",
    });
  }
};

module.exports = protectionMW;
