const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middlewares/authMiddleware");

router.get("/", auth, notificationController.getNotifications);
router.patch("/:id/read", auth, notificationController.markRead);
router.patch("/read-all", auth, notificationController.markAllRead);

module.exports = router;
