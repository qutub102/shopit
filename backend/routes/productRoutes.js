const express = require("express");
const app = require("../app");
const router = express.Router();

const productControllers = require("../controllers/productControllers");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");

router.route("/products").get(productControllers.getProducts);

router
  .route("/admin/products")
  .get(
    isAuthenticated,
    authorizedRoles("admin"),
    productControllers.getAdminProducts
  );

router
  .route("/admin/createProduct")
  .post(
    isAuthenticated,
    authorizedRoles("admin"),
    productControllers.createProduct
  );
router.route("/product/:id").get(productControllers.getProductById);
router
  .route("/admin/product/:id")
  .put(
    isAuthenticated,
    authorizedRoles("admin"),
    productControllers.updateProduct
  )
  .delete(
    isAuthenticated,
    authorizedRoles("admin"),
    productControllers.deleteProduct
  );

router
  .route("/review")
  .put(isAuthenticated, productControllers.createReview)
  .delete(
    isAuthenticated,
    authorizedRoles("admin"),
    productControllers.deleteReview
  );
router.route("/reviews").get(isAuthenticated, productControllers.getAllReviews);

module.exports = router;
