const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    sku: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", select: false }, // This will prevent saving the seller field
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    photo: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
