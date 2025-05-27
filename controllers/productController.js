const productModel = require("../models/productModel");
const APIFeatures = require("../utils/APIF");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, sku, isAvailable, ownerId, storeId } = req.body;

    let photoFilename = null;
    if (req.file) {
      const uploadDir = path.join(__dirname, "../upload");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueFilename = `${Date.now()}-${name}-${storeId}${path.extname(req.file.originalname)}`;
      const newFilePath = path.join(uploadDir, uniqueFilename);

      fs.renameSync(req.file.path, newFilePath);

      photoFilename = uniqueFilename;
    }

    const newProduct = new productModel({
      name,
      description,
      price,
      category,
      sku,
      isAvailable,
      seller: ownerId,
      storeId,
      photo: photoFilename,
    });

    await newProduct.save();

    res.status(201).send({
      success: true,
      message: "Product created successfully.",
      newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error creating product.",
      error: error.message,
    });
  }
};

const getAllProductsController = async (req, res) => {
  try {
    const features = new APIFeatures(productModel.find(), req.query)
      .filter()
      .sort()
      .pagination();

    const products = await features.query.lean();

    if (!products || products.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No products found",
      });
    }

    // Remove seller (ownerId) from each product
    products.forEach(product => {
      delete product.seller;  // Remove the seller field
    });

    res.status(200).send({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};



const getSingleProductController = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).send({
        success: false,
        message: "Please provide a product ID",
      });
    }
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "No product found with this ID",
      });
    }
    res.status(200).send({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in get single product API",
      error,
    });
  }
};

const updateProductController = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).send({
        success: false,
        message: "Please provide a product ID",
      });
    }

    const updates = req.body;
    const updatedProduct = await productModel.findByIdAndUpdate(productId, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).send({
        success: false,
        message: "No product found with this ID",
      });
    }

    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in update product API",
      error,
    });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).send({
        success: false,
        message: "Please provide a product ID",
      });
    }

    const deletedProduct = await productModel.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).send({
        success: false,
        message: "No product found with this ID",
      });
    }

    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in delete product API",
      error,
    });
  }
};

const placeOrderController = async (req, res) => {
  try {
    const { cart, buyerId } = req.body;

    // Validate buyer ID
    if (!mongoose.Types.ObjectId.isValid(buyerId)) {
      return res.status(400).send({ success: false, message: "Invalid buyer ID" });
    }

    // Ensure cart is not empty
    if (!cart || cart.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Cart cannot be empty",
      });
    }

    // Get product IDs from cart
    const productIds = cart.map(item => item.productId);

    // Fetch products from the database
    const products = await productModel.find({ _id: { $in: productIds } });

    // Check if all products in the cart are valid
    if (products.length !== cart.length) {
      const invalidProductIds = cart.filter(item => !products.some(product => product._id.toString() === item.productId));
      return res.status(400).send({
        success: false,
        message: `The following products are invalid or no longer available: ${invalidProductIds.map(item => item.productId).join(', ')}`,
      });
    }

    let total = 0;
    let storeOrders = {};

    // Process each product in the cart
    for (let item of cart) {
      const product = products.find(p => p._id.toString() === item.productId);

      // Check stock availability
      if (!product || product.stock < item.quantity) {
        return res.status(400).send({
          success: false,
          message: `Product ${product.name} is out of stock or invalid quantity`,
        });
      }

      // Add the product's price to the total
      total += product.price * item.quantity;

      // Group products by storeId
      if (!storeOrders[product.storeId]) {
        storeOrders[product.storeId] = {
          products: [],
          total: 0,
        };
      }

      // Add product to the appropriate store order
      storeOrders[product.storeId].products.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
      storeOrders[product.storeId].total += product.price * item.quantity;
    }

    // Create orders for each store
    const createdOrders = [];
    for (const storeId in storeOrders) {
      const orderData = storeOrders[storeId];
      const newOrder = new orderModel({
        Product: orderData.products.map(item => item.productId),
        total: orderData.total,
        buyer: buyerId,
        storeId,
      });

      // Save the order for the store
      const savedOrder = await newOrder.save();
      createdOrders.push(savedOrder);
    }

    // Return the response
    res.status(201).send({
      success: true,
      message: "Order placed successfully",
      createdOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in place order API",
      error: error.message,
    });
  }
};

const updateOrderStatusController = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(400).send({
        success: false,
        message: "Please provide an order ID",
      });
    }

    const { status } = req.body;
    const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!updatedOrder) {
      return res.status(404).send({
        success: false,
        message: "No order found to update",
      });
    }

    res.status(200).send({
      success: true,
      message: "Order status updated successfully",
      updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in update order status API",
      error,
    });
  }
};

const viewOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const order = await orderModel.findById(id)
      .populate('Product')
      .populate('storeId');

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    if (order.buyer.toString() !== userId && order.storeId.owner.toString() !== userId) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    res.status(200).send({
      success: true,
      orderDetails: {
        orderNumber: order._id,
        buyer: order.buyer,
        status: order.status,
        products: order.Product,
        store: order.storeId._id,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching order status",
      error: error.message,
    });
  }
};

const viewStoreOrdersController = async (req, res) => {
  try {
    const { storeId } = req.body;
    const { ownerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid store ID",
      });
    }

    const orders = await orderModel.find({ storeId }).populate('Product');

    if (!orders || orders.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No orders found for this store",
      });
    }

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    res.status(200).send({
      success: true,
      message: "Orders retrieved successfully",
      totalOrders: orders.length,
      totalRevenue,
      orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching store orders",
      error: error.message,
    });
  }
};
const modifyOrderController = async (req, res) => {
  try {
    const { orderId, updatedCart, buyerId } = req.body;

    // Validate the orderId and buyerId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).send({ success: false, message: "Invalid order ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(buyerId)) {
      return res.status(400).send({ success: false, message: "Invalid buyer ID" });
    }

    // Find the order
    const order = await orderModel.findById(orderId).populate("Product");

    if (!order) {
      return res.status(404).send({ success: false, message: "Order not found" });
    }

    // Ensure the order is owned by the buyer and the status is "preparing"
    if (order.buyer.toString() !== buyerId) {
      return res.status(403).send({ success: false, message: "You do not have permission to modify this order" });
    }

    if (order.status !== "preparing") {
      return res.status(400).send({ success: false, message: "Cannot modify an order that is not in 'preparing' status" });
    }

    // Validate the updated cart
    if (!updatedCart || updatedCart.length === 0) {
      return res.status(400).send({ success: false, message: "Updated cart cannot be empty" });
    }

    const productIds = updatedCart.map(item => item.productId);
    const products = await productModel.find({ _id: { $in: productIds } });

    // Check if all products in the updated cart are valid
    if (products.length !== updatedCart.length) {
      const invalidProductIds = updatedCart.filter(item => !products.some(product => product._id.toString() === item.productId));
      return res.status(400).send({
        success: false,
        message: `The following products are invalid or no longer available: ${invalidProductIds.map(item => item.productId).join(', ')}`,
      });
    }

    let total = 0;
    for (let item of updatedCart) {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).send({
          success: false,
          message: `Product ${product.name} is out of stock or invalid quantity`,
        });
      }
      total += product.price * item.quantity;
    }

    // Update the order with new products and total price
    order.Product = updatedCart.map(item => item.productId);
    order.total = total;
    await order.save();

    res.status(200).send({
      success: true,
      message: "Order modified successfully",
      updatedOrder: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error modifying the order",
      error: error.message,
    });
  }
};


module.exports = {
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
};
