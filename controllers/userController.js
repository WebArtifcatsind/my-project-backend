
//D:\office\webartifacts\web-backend\controllers\userController.js
import connection from "../models/db.js";

// ✅ Get all users (Admin only)
export const getAllUsers = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const sql = "SELECT id, name, email, role, created_at FROM users";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.status(200).json(results);
  });
};

// ✅ Delete user by ID (Admin only)
export const deleteUser = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ?";
  connection.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.status(200).json({ message: "User deleted successfully" });
  });
};



// ✅ Get only staff users
export const getStaffOnly = (req, res) => {
  const query = "SELECT id, name, email FROM users WHERE role = 'staff'";
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.status(200).json(results);
  });
};
