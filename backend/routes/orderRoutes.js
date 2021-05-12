const express = require("express");
const router = express.Router();

const orderControllers = require("../controllers/orderController");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");

router.route("/order").post(isAuthenticated, orderControllers.createOrder);
router.route("/order/:id").get(isAuthenticated, orderControllers.orderById);
router.route("/orders").get(isAuthenticated, orderControllers.getOrders);
router
  .route("/admin/orders")
  .get(
    isAuthenticated,
    authorizedRoles("admin"),
    orderControllers.getOrdersAdmin
  );

router
  .route("/admin/order/:id")
  .put(
    isAuthenticated,
    authorizedRoles("admin"),
    orderControllers.orderByIdAdmin
  )
  .delete(
    isAuthenticated,
    authorizedRoles("admin"),
    orderControllers.deleteOrder
  );

module.exports = router;
