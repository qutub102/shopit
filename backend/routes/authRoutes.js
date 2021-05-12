const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
router.route("/register").post(authController.registerUser);
router.route("/login").post(authController.login);
router.route("/logout").get(authController.logout);
router.route("/password/reset").post(authController.forgetPassword);
router.route("/password/reset/:token").put(authController.resetPassword);
router.route("/me").get(isAuthenticated, authController.getUserProfile);
router
  .route("/password/update")
  .put(isAuthenticated, authController.updatePassword);
router
  .route("/me/update")
  .put(isAuthenticated, authController.updateUserProfile);

router
  .route("/admin/users")
  .get(isAuthenticated, authorizedRoles("admin"), authController.getAllUsers);

router
  .route("/admin/user/:id")
  .get(isAuthenticated, authorizedRoles("admin"), authController.getUserById)
  .put(
    isAuthenticated,
    authorizedRoles("admin"),
    authController.updateUserByAdmin
  )
  .delete(
    isAuthenticated,
    authorizedRoles("admin"),
    authController.deleteUserByAdmin
  );

module.exports = router;
