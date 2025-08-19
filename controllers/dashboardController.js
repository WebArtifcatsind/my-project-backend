


import connection from "../models/db.js";

// ✅ Admin Dashboard
export const getAdminDashboard = (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role = 'staff') AS totalStaff,
      (SELECT COUNT(*) FROM leaves) AS totalLeaves,
      (SELECT COUNT(*) FROM staff_documents) AS totalUploads,
      (SELECT COUNT(*) FROM attendance WHERE date = CURDATE() AND status = 'present') AS todaysPresent
  `;

  connection.query(query, (err, result) => {
    if (err) {
      console.error("DB Error (Admin Dashboard):", err);  // Add this line
      return res.status(500).json({ error: "Dashboard fetch failed" });
    }

    res.status(200).json(result[0]);
  });
};


// Staff dashboard
export const getStaffDashboard = (req, res) => {
  const staffId = req.user.id;

  const query = `
    SELECT 
      (SELECT COUNT(*) FROM leaves WHERE user_id = ?) AS totalLeaves,
      (SELECT COUNT(*) FROM leaves WHERE user_id = ? AND status = 'approved') AS approvedLeaves,
      (SELECT COUNT(*) FROM staff_documents WHERE user_id = ?) AS uploadedDocs,
      (
        SELECT 
          ROUND((SUM(status = 'present') / COUNT(*)) * 100, 2) 
        FROM attendance 
        WHERE user_id = ?
      ) AS attendancePercentage
  `;

  connection.query(query, [staffId, staffId, staffId, staffId], (err, results) => {
    if (err) {
      console.error("DB error (staff dashboard):", err);
      return res.status(500).json({ error: "Dashboard fetch failed" });
    }

    res.status(200).json(results[0]);
  });
};
