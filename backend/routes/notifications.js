const express = require('express');
const router = express.Router();
const { Notification, NotificationRead } = require('../db/mongodb');

/**
 * GET /api/notifications
 * Retrieves announcements/notifications delivered to a specific class or student
 */
router.get('/', async (req, res) => {
  try {
    const { classCode, userId } = req.query;

    const filter = {};
    if (classCode && classCode !== 'ALL') {
      filter.target_class = { $in: [classCode.trim(), 'ALL'] };
    }

    const notifications = await Notification.find(filter)
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    // Check which notifications this user has marked as read
    const activeUserId = userId || 'anonymous';
    const readDocs = await NotificationRead.find({ user_id: activeUserId }).lean();
    const readSet = new Set(readDocs.map(r => r.notification_id));

    const enriched = notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      target_class: n.target_class,
      sender_id: n.sender_id,
      sender_name: n.sender_name,
      sender_role: n.sender_role,
      created_at: n.created_at,
      is_read: readSet.has(n.id) ? 1 : 0
    }));

    const unreadCount = enriched.filter(n => !n.is_read).length;

    return res.json({
      unreadCount,
      notifications: enriched
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ error: 'Failed to retrieve notifications: ' + err.message });
  }
});

/**
 * POST /api/notifications
 * Teacher or Admin broadcasts an announcement to a class
 */
router.post('/', async (req, res) => {
  try {
    const { title, message, target_class, sender_id, sender_name, sender_role } = req.body;

    if (!title || !message || !target_class) {
      return res.status(400).json({ error: 'Title, message, and target_class are required.' });
    }

    const notifId = `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const created = await Notification.create({
      id: notifId,
      title: title.trim(),
      message: message.trim(),
      target_class: target_class.trim(),
      sender_id: sender_id || null,
      sender_name: sender_name || 'Faculty Instructor',
      sender_role: sender_role || 'teacher'
    });

    return res.status(201).json({
      message: `Announcement broadcasted to class ${target_class}.`,
      notification: created
    });
  } catch (err) {
    console.error('Error creating notification:', err);
    return res.status(500).json({ error: 'Failed to send announcement: ' + err.message });
  }
});

/**
 * POST /api/notifications/:id/read
 * Mark single notification as read
 */
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    await NotificationRead.findOneAndUpdate(
      { notification_id: id, user_id: userId },
      { notification_id: id, user_id: userId, read_at: new Date() },
      { upsert: true, new: true }
    );

    return res.json({ message: 'Marked as read.' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return res.status(500).json({ error: 'Failed to mark as read.' });
  }
});

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications for class/user as read
 */
router.post('/mark-all-read', async (req, res) => {
  try {
    const { userId, classCode } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const filter = {};
    if (classCode && classCode !== 'ALL') {
      filter.target_class = { $in: [classCode.trim(), 'ALL'] };
    }

    const notifs = await Notification.find(filter).select('id').lean();

    const operations = notifs.map(n => ({
      updateOne: {
        filter: { notification_id: n.id, user_id: userId },
        update: { $set: { notification_id: n.id, user_id: userId, read_at: new Date() } },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await NotificationRead.bulkWrite(operations);
    }

    return res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    return res.status(500).json({ error: 'Failed to mark all as read: ' + err.message });
  }
});

module.exports = router;
