const notificationService = require("../services/notificationService");

module.exports.getNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user.id);
        res.json({ data: notifications });
    } catch (error) {
        res.status(500).json({ message: "Error fetching notifications", error });
    }
};

module.exports.markRead = async (req, res) => {
    try {
        const notification = await notificationService.markAsRead(req.params.id);
        res.json({ message: "Notification marked as read", data: notification });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || "Error updating notification", error });
    }
};

module.exports.markAllRead = async (req, res) => {
    try {
        await notificationService.markAllAsRead(req.user.id);
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Error updating notifications", error });
    }
};
