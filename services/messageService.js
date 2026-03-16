const Message = require("../models/messageSchema");
const notificationService = require("./notificationService");

async function sendMessage(senderId, receiverId, content) {
    const message = new Message({ senderId, receiverId, content });
    await message.save();

    await notificationService.sendNotification(
        receiverId,
        "New Message",
        "You have received a new message.",
        "MESSAGE"
    );

    return message;
}

async function getChatHistory(userId, otherUserId) {
    return await Message.find({
        $or: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
        ]
    }).sort({ createdAt: 1 });
}

async function getUnreadMessages(userId) {
    return await Message.find({ receiverId: userId, isRead: false }).populate("senderId", "name");
}

module.exports = {
    sendMessage,
    getChatHistory,
    getUnreadMessages
};
