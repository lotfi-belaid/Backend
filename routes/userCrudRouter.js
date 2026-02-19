const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// list & search users
router.get("/", userController.getAllUsers);
router.get("/by-role/:role", userController.getUsersByRole);
router.get("/search", userController.search);

// update/delete before :id
router.put("/:id", userController.updateUserById);
router.delete("/:id", userController.deleteUserById);
router.get("/:id", userController.getUserById);

module.exports = router;
