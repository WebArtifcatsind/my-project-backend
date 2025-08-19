// controllers/notificationController.js
import connection from "../models/db.js";

// ✅ 1. Admin sends notification (to all staff or selected)
export const sendNotification = (req, res) => {
  const { title, message, recipientIds } = req.body; // recipientIds is optional

  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  const insertNotification = `INSERT INTO notifications (title, message) VALUES (?, ?)`;

  connection.query(insertNotification, [title, message], (err, result) => {
    if (err) {
      console.error("DB error (notification insert):", err);
      return res.status(500).json({ error: "Database error" });
    }

    const notificationId = result.insertId;

    if (Array.isArray(recipientIds) && recipientIds.length > 0) {
      // ✅ Send to specific users
      const values = recipientIds.map(id => [notificationId, id]);
      const insertRecipients = `INSERT INTO notification_recipients (notification_id, recipient_id) VALUES ?`;

      connection.query(insertRecipients, [values], (err2) => {
        if (err2) {
          console.error("DB error (recipient insert):", err2);
          return res.status(500).json({ error: "Failed to assign recipients" });
        }

        res.status(200).json({ message: "Notification sent to selected users" });
      });
    } else {
      // ✅ Send to all staff (NULL recipient_id means all)
      const insertAll = `INSERT INTO notification_recipients (notification_id, recipient_id) VALUES (?, NULL)`;
      connection.query(insertAll, [notificationId], (err3) => {
        if (err3) {
          console.error("DB error (broadcast insert):", err3);
          return res.status(500).json({ error: "Failed to broadcast" });
        }

        res.status(200).json({ message: "Notification broadcasted to all staff" });
      });
    }
  });
};

// ✅ 2. Staff fetches their notifications (direct + broadcast)
export const getNotificationsForStaff = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT n.id, n.title, n.message, n.created_at,
           IF(r.recipient_id IS NULL, 'all', 'individual') AS type,
           (SELECT COUNT(*) FROM notification_reads nr WHERE nr.notification_id = n.id AND nr.staff_id = ?) AS is_read
    FROM notifications n
    JOIN notification_recipients r ON n.id = r.notification_id
    WHERE r.recipient_id = ? OR r.recipient_id IS NULL
    GROUP BY n.id
    ORDER BY n.created_at DESC
  `;

  connection.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error("DB error (getNotificationsForStaff):", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
};

// ✅ 3. Mark one notification as read
export const markNotificationRead = (req, res) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  const query = `INSERT IGNORE INTO notification_reads (notification_id, staff_id) VALUES (?, ?)`;

  connection.query(query, [notificationId, userId], (err) => {
    if (err) {
      console.error("DB error (markRead):", err);
      return res.status(500).json({ error: "Failed to mark as read" });
    }

    res.status(200).json({ message: "Marked as read" });
  });
};

// ✅ 4. Mark all notifications as read
export const markAllNotificationsRead = (req, res) => {
  const userId = req.user.id;

  const query = `
    INSERT IGNORE INTO notification_reads (notification_id, staff_id)
    SELECT n.id, ? FROM notifications n
    JOIN notification_recipients r ON n.id = r.notification_id
    WHERE r.recipient_id = ? OR r.recipient_id IS NULL
  `;

  connection.query(query, [userId, userId], (err) => {
    if (err) {
      console.error("DB error (markAllRead):", err);
      return res.status(500).json({ error: "Failed to mark all as read" });
    }

    res.status(200).json({ message: "All notifications marked as read" });
  });
};

// ✅ 5. Admin deletes a notification
export const deleteNotification = (req, res) => {
  const { id } = req.params;

  const deleteReads = `DELETE FROM notification_reads WHERE notification_id = ?`;
  const deleteRecipients = `DELETE FROM notification_recipients WHERE notification_id = ?`;
  const deleteNotification = `DELETE FROM notifications WHERE id = ?`;

  connection.query(deleteReads, [id], (err1) => {
    if (err1) return res.status(500).json({ error: "Error deleting reads" });

    connection.query(deleteRecipients, [id], (err2) => {
      if (err2) return res.status(500).json({ error: "Error deleting recipients" });

      connection.query(deleteNotification, [id], (err3) => {
        if (err3) return res.status(500).json({ error: "Error deleting notification" });

        res.status(200).json({ message: "Notification deleted" });
      });
    });
  });
};

// ✅ 6. Admin edits notification (title + message only)
export const updateNotification = (req, res) => {
  const { id } = req.params;
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: "Title and message are required" });
  }

  const query = `UPDATE notifications SET title = ?, message = ? WHERE id = ?`;
  connection.query(query, [title, message, id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to update" });
    res.status(200).json({ message: "Notification updated" });
  });
};

// ✅ 7. Admin gets all notifications
export const getAllNotifications = (req, res) => {
  const query = `
    SELECT n.*, 
           GROUP_CONCAT(CASE 
              WHEN r.recipient_id IS NULL THEN 'All Staff' 
              ELSE r.recipient_id
           END) AS recipients
    FROM notifications n
    JOIN notification_recipients r ON n.id = r.notification_id
    GROUP BY n.id
    ORDER BY n.created_at DESC
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("DB error (getAllNotifications):", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
};