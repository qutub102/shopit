const catchAsyncError = require("../middleware/catchAsyncError");
const Order = require("../models/orders");
const Product = require("../models/products");
const ErrorHandler = require("../utils/errorHandler");

// updating product stocks
async function updateStock(productId, quantity) {
  const product = await Product.findOne({ _id: productId });
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

exports.createOrder = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user._id;
  const orders = await Order.create(req.body);
  res.status(201).json({ success: true, orders });
});

exports.orderById = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) return next(new ErrorHandler("Order Not Found", 404));
  res.status(200).json({ success: true, order });
});

exports.getOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    "orderItems.product",
    "seller category"
  );
  // if (orders.length <= 0) return next(new ErrorHandler("Order Not Found"));
  res.status(200).json({ success: true, orders });
});

// get Orders by Admin => api/v1/admin/order
exports.getOrdersAdmin = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find().populate("user", "name email");
  // if (orders.length <= 0) return next(new ErrorHandler("Order Not Found", 404));

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({ success: true, totalAmount, orders });
});

// update orders by Admin => api/v1/admin/order/:id
exports.orderByIdAdmin = catchAsyncError(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) return next(new ErrorHandler("Order Not Found", 404));
  console.log(order);
  if (order.orderStatus === "Delivered")
    return next(new ErrorHandler("You have already delivered this order", 400));

  order.orderItems.forEach(async (order) => {
    await updateStock(order.product, order.quantity);
  });

  order.orderStatus = req.body.status;
  order.deliveredAt = Date.now();

  await order.save();
  res.status(200).json({ success: true });
});

exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id });
  if (!order) return next(new ErrorHandler("Order Not Found", 404));
  await order.remove();
  res.status(200).json({
    success: true,
  });
});
