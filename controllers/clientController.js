

// controllers/clientController.js

import connection from "../models/db.js";

// ✅ Submit Complaint
export const submitComplaint = (req, res) => {
  const { name, email, subject, message } = req.body;
  const file = req.file ? req.file.filename : null;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields except file are required" });
  }

  const query = "INSERT INTO complaints (name, email, subject, message, file) VALUES (?, ?, ?, ?, ?)";
  const values = [name, email, subject, message, file];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Database error (submitComplaint):", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json({ message: "Complaint submitted successfully" });
  });
};

// ✅ Assign complaint to staff
export const assignComplaint = (req, res) => {
  const { complaintId, staffId } = req.body;

  if (!complaintId || !staffId) {
    return res.status(400).json({ error: "Missing complaintId or staffId" });
  }

  const query = "UPDATE complaints SET assigned_to = ? WHERE id = ?";
  connection.query(query, [staffId, complaintId], (err, result) => {
    if (err) {
      console.error("Database error (assignComplaint):", err);
      return res.status(500).json({ error: "Failed to assign complaint" });
    }

    res.status(200).json({ message: "Complaint assigned successfully" });
  });
};

// ✅ Submit Feedback with file upload
export const submitFeedback = (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = "INSERT INTO feedback (name, email, message, is_public) VALUES (?, ?, ?, false)";
  const values = [name, email, message];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json({ message: "Feedback submitted successfully" });
  });
};

// ✅ Get All Complaints (Admin Only)
export const getAllComplaints = (req, res) => {
  const query = `
    SELECT complaints.id, complaints.name, complaints.email, complaints.subject, complaints.message,
           complaints.file, complaints.submitted_at, complaints.status,
           users.name AS assigned_staff
    FROM complaints
    LEFT JOIN users ON complaints.assigned_to = users.id
    ORDER BY complaints.submitted_at DESC
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error (getAllComplaints):", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
};


// ✅ Get All Feedbacks (Admin Only)
export const getAllFeedbacks = (req, res) => {
  const query = "SELECT id, name, email, message, submitted_at, is_public FROM feedback ORDER BY submitted_at DESC";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Database error (getAllFeedbacks):", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
};

// ✅ Delete Feedback by ID (Admin Only)
export const deleteFeedback = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM feedback WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error (deleteFeedback):", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  });
};

// ✅ Delete Complaint by ID (Admin Only)
export const deleteComplaint = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM complaints WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error (deleteComplaint):", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json({ message: "Complaint deleted successfully" });
  });
};

// ✅ Admin marks feedback as public
export const markFeedbackPublic = (req, res) => {
  const { id } = req.params;
  const query = "UPDATE feedback SET is_public = true WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("DB error (markPublic):", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json({ message: "Feedback marked as public" });
  });
};

// ✅ Get all public feedbacks (for frontend)
export const getPublicFeedbacks = (req, res) => {
  const query = "SELECT name, message, submitted_at FROM feedback WHERE is_public = true ORDER BY submitted_at DESC";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("DB error (getPublicFeedbacks):", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
};

// ✅ Remove public status (make private)
export const removePublicStatus = (req, res) => {
  const { id } = req.params;
  const query = "UPDATE feedback SET is_public = false WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("DB error (removePublicStatus):", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json({ message: "Feedback set to private" });
  });
};


// ✅ Staff - Get complaints assigned to logged-in staff
export const getAssignedComplaints = (req, res) => {
  const staffId = req.user.userId;

  const query = `
    SELECT id, name, email, subject, message, file, submitted_at, status
    FROM complaints
    WHERE assigned_to = ? AND visible_to_staff = true
    ORDER BY submitted_at DESC
  `;

  connection.query(query, [staffId], (err, results) => {
    if (err) {
      console.error("DB error (getAssignedComplaints):", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
};




// ✅ Mark complaint as resolved (Staff or Admin)
export const markComplaintResolved = (req, res) => {
  const { id } = req.params;

  const query = "UPDATE complaints SET status = 'Resolved' WHERE id = ?";
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error (markComplaintResolved):", err);
      return res.status(500).json({ error: "Failed to update complaint status" });
    }

    res.status(200).json({ message: "Complaint marked as resolved" });
  });
};





// ✅ Staff removes complaint only from their dashboard view (soft delete)
export const deleteStaffComplaint = (req, res) => {
  const complaintId = req.params.id;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Soft delete: just mark visible_to_staff = false
  const query = `
    UPDATE complaints 
    SET visible_to_staff = false 
    WHERE id = ? AND assigned_to = ?
  `;

  connection.query(query, [complaintId, userId], (err, result) => {
    if (err) {
      console.error("Database error (deleteStaffComplaint):", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Unauthorized or complaint not found" });
    }

    res.status(200).json({ message: "Complaint hidden from staff dashboard" });
  });
};







