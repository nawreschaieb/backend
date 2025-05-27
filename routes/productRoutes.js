const express = require("express");
const upload = require("../middlewares/upload");
const adminMiddleware = require("../middlewares/adminMiddleware");
const protectionMW= require("../middlewares/Protection");
const {
  createProductController,
  getAllProductsController,
  getSingleProductController,
  updateProductController,
  deleteProductController,
  placeOrderController,
  updateOrderStatusController,
  viewOrderStatusController,
  viewStoreOrdersController,
  modifyOrderController,
} = require("../controllers/productController");

const router = express.Router();

// Routes
// CREATE PRODUCT
// router.post("/create/", upload.single("photo"), protectionMW,checkStoreOwnership, createProductController);

// GET ALL PRODUCTS
router.get("/getAll", protectionMW,getAllProductsController);

// GET SINGLE PRODUCT
router.get("/get/:id", protectionMW,getSingleProductController);

// GET PRODUCTS BY STORE

// UPDATE PRODUCT
//router.put("/update/:id",checkStoreOwnership,protectionMW, updateProductController);

// DELETE PRODUCT
router.delete("/delete/:id", protectionMW,adminMiddleware, deleteProductController);

// PLACE ORDER
router.post("/placeOrder", protectionMW, placeOrderController);

// UPDATE ORDER STATUS
//router.post("/orderStatus/:id",protectionMW,checkStoreOwnership,updateOrderStatusController);
router.get("/ordercheck/:id",protectionMW,viewOrderStatusController);
//router.get("/total/",protectionMW,checkStoreOwnership,viewStoreOrdersController)
router.post("/modify/",protectionMW,modifyOrderController)
module.exports = router;
