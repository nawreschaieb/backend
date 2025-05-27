const express = require("express");
const {
  registerController,
  loginController,
  logoutController,
} = require("../controllers/authControllers");

const router = express.Router();

//routes
//REGISTER || POST
router.post("/register", registerController);

// LOGIN || POST
router.post("/login", loginController);
router.post("/logout",logoutController)

module.exports = router;
