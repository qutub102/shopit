const express = require("express");
const router = express.Router();

const {
  processPayment,
  sendStripApi,
} = require("../controllers/paymentController");

const { isAuthenticated } = require("../middleware/auth");

router.route("/payment/process").post(isAuthenticated, processPayment);
router.route("/stripeapi").get(isAuthenticated, sendStripApi);

module.exports = router;
