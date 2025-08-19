

// controllers/leaveController.js
import connection from "../models/db.js";

// ✅ Staff applies for leave
export const applyLeave = (req, res) => {
  const { staffId, from_date, to_date, reason } = req.body;

  if (!staffId || !from_date || !to_date || !reason) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO leave_requests (staff_id, from_date, to_date, reason)
    VALUES (?, ?, ?, ?)`;

  connection.query(query, [staffId, from_date, to_date, reason], (err, result) => {
    if (err) return res.status(500).json({ error: "DB Error", details: err });
    res.status(200).json({ message: "Leave request submitted" });
  });
};

// ✅ Admin views all leave requests
export const getAllLeaveRequests = (req, res) => {
  const query = `
    SELECT lr.*, u.name AS staff_name FROM leave_requests lr
    JOIN users u ON lr.staff_id = u.id
    ORDER BY lr.created_at DESC`;

  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.status(200).json(results);
  });
};

// ✅ Admin approves/rejects a leave
export const updateLeaveStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const query = `UPDATE leave_requests SET status = ? WHERE id = ?`;

  connection.query(query, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: "DB Error", details: err });
    res.status(200).json({ message: `Leave ${status}` });
  });
};
