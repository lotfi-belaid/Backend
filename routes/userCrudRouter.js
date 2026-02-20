const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");
const requireRole = require("../middlewares/requireRole");

// list & search users
router.get("/", auth, requireRole("ADMIN"), userController.getAllUsers);
router.get("/by-role/:role", auth, requireRole("ADMIN"), userController.getUsersByRole);
router.get("/search", auth, requireRole("ADMIN"), userController.search);

// update/delete before :id
router.put("/:id", auth, requireRole("ADMIN"), userController.updateUserById);
router.delete("/:id", auth, requireRole("ADMIN"), userController.deleteUserById);
router.get("/:id", auth, requireRole("ADMIN"), userController.getUserById);

module.exports = router;
