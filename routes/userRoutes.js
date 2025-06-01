const express = require("express");
const {
  getAllUsersController,
  getUserController,
  updateUserController,
  updatePasswordController,
  resetPasswordController,
  deleteProfileController,
} = require("../controllers/userController");
const admin = require("../middlewares/adminMiddleware");
const protectionMW= require("../middlewares/Protection");

const router = express.Router();

//routes
// GET USER || GET
router.get("/getAll", protectionMW,admin, getAllUsersController);
router.get("/getUser/:id",  getUserController);

// UPDATE PROFILE
router.put("/updateUser", protectionMW, updateUserController);

//password update
router.post("/updatePassword",protectionMW, updatePasswordController);
1
// RESET PASSWORD
router.post("/resetPassword", resetPasswordController);

// delete USER
router.delete("/deleteUser/:id", protectionMW,admin, deleteProfileController);

module.exports = router;
