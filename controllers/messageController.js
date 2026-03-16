const messageService = require("../services/messageService");

module.exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const message = await messageService.sendMessage(req.user.id, receiverId, content);
        res.json({ message: "Message sent", data: message });
    } catch (error) {
        res.status(500).json({ message: "Error sending message", error });
    }
};

module.exports.getChatHistory = async (req, res) => {
    try {
        const history = await messageService.getChatHistory(req.user.id, req.params.otherUserId);
        res.json({ data: history });
    } catch (error) {
        res.status(500).json({ message: "Error fetching chat history", error });
    }
};

module.exports.getUnread = async (req, res) => {
    try {
        const unread = await messageService.getUnreadMessages(req.user.id);
        res.json({ data: unread });
    } catch (error) {
        res.status(500).json({ message: "Error fetching unread messages", error });
    }
};
