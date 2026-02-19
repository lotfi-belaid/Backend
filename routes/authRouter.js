const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const uploadfile = require("../middlewares/uploadfile");

// create users with image upload
router.post(
  "/owners",
  uploadfile.single("image_User"),
  userController.createOwnerWithImg,
);
router.post(
  "/tenants",
  uploadfile.single("image_User"),
  userController.createTenantWithImg,
);
router.post(
  "/vendors",
  uploadfile.single("image_User"),
  userController.createVendorWithImg,
);

// create admin (no image)
router.post("/admin", userController.createAdmin);

// login
router.post("/login", userController.loginUser);

module.exports = router;
