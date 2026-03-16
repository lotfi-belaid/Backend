const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middlewares/authMiddleware");

router.post("/send", auth, messageController.sendMessage);
router.get("/history/:otherUserId", auth, messageController.getChatHistory);
router.get("/unread", auth, messageController.getUnread);

module.exports = router;
