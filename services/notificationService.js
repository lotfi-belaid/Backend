const Notification = require("../models/notificationSchema");

/**
 * Send a notification by saving it to the database.
 */
async function sendNotification(userId, title, message, type = "GENERAL") {
    const notification = new Notification({
        userId,
        title,
        message,
        type
    });
    await notification.save();
    
    // In a real app, you would also trigger a WebSocket event or send an email here.
    console.log(`[NOTIFICATION SAVED] To User ${userId}: ${title}`);
    return notification;
}

/**
 * Fetch all notifications for a specific user.
 */
async function getUserNotifications(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
}

/**
 * Mark a specific notification as read.
 */
async function markAsRead(notificationId) {
    const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
    );
    if (!notification) {
        const error = new Error("Notification not found");
        error.status = 404;
        throw error;
    }
    return notification;
}

/**
 * Mark all notifications for a user as read.
 */
async function markAllAsRead(userId) {
    return await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
    );
}

module.exports = {
    sendNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
