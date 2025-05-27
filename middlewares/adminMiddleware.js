const userModel = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).send({
        success: false,
        message: "User not authenticated.",
      });
    }

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    if (user.usertype !== "admin") {
      return res.status(403).send({
        success: false,
        message: "Only admin can access this resource.",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Unauthorized access.",
      error,
    });
  }
};
