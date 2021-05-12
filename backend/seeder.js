const Product = require("./models/products");
const productData = require("./data/products");
const Order = require("./models/orders");
const orderData = require("./data/orders");
const User = require("./models/user");

const dotenv = require("dotenv");
dotenv.config({ path: "backend/config/config.env" });
// dotenv.config();
// connedting mongodb
require("./config/db").connectDB();

const importData = async () => {
  try {
    await Product.deleteMany();
    await Order.deleteMany();
    const userData = await User.findOne();
    const updatedOrders = orderData.map((o) => {
      return {
        ...o,
        user: userData._id,
      };
    });
    const updatedProducts = productData.map((p) => {
      return {
        ...p,
        user: userData._id,
      };
    });
    await Product.insertMany(updatedProducts);
    await Order.insertMany(updatedOrders);
    console.log("Data Imported");
    process.exit();
  } catch (err) {
    console.log("Error in importing data " + err);
    process.exit();
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await Order.deleteMany();
    console.log("Product Destroyed");
    console.log("Order Destroyed");
    process.exit();
  } catch (err) {
    console.log("Error in destroying data : " + err);
    process.exit();
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
