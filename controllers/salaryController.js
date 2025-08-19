// controllers/salaryController.js
import multer from "multer";
import path from "path";
import fs from "fs";
import connection from "../models/db.js";

// 📁 Ensure uploads/salaryslips exists
const salaryDir = path.resolve("uploads/salaryslips");
if (!fs.existsSync(salaryDir)) fs.mkdirSync(salaryDir, { recursive: true });

// 📦 Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, salaryDir),
  filename: (req, file, cb) => {
    const userId = req.body.userId;
    const ext = path.extname(file.originalname);
    cb(null, `${userId}_${Date.now()}${ext}`);
  },
});
export const upload = multer({ storage });

// ✅ Upload Salary Slip (Admin only)
export const uploadSalarySlip = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admin can upload slips." });
  }

  const file = req.file;
  const { userId } = req.body;

  const sql = `INSERT INTO salary_slips (user_id, file_path, uploaded_at) VALUES (?, ?, NOW())`;
  connection.query(sql, [userId, file.filename], (err) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    res.status(200).json({ message: "Salary slip uploaded successfully." });
  });
};

// ✅ View salary slips (Staff)
export const getMySalarySlips = (req, res) => {
  const userId = req.user.userId;

  const sql = `SELECT file_path, uploaded_at FROM salary_slips WHERE user_id = ? ORDER BY uploaded_at DESC`;
  connection.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    res.status(200).json(results);
  });
};

// ✅ Download endpoint (serves file)
export const downloadSlip = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(salaryDir, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }
  res.download(filePath);
};

// ✅ Staff requests salary slip
export const requestSalarySlip = (req, res) => {
  const userId = req.user?.id;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  if (!userId) return res.status(400).json({ message: "User ID missing" });

  const query = `
    SELECT * FROM salary_slips 
    WHERE staff_id = ? AND MONTH(slip_date) = ? AND YEAR(slip_date) = ?
  `;

  connection.query(query, [userId, currentMonth, currentYear], (err, results) => {
    if (err) {
      console.error("Error fetching salary slip:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No salary slip found for this month." });
    }

    res.status(200).json({
      message: "Salary slip is ready for download.",
      slip: results[0],
    });
  });
};

// ✅ Admin views all salary requests
export const viewSalaryRequests = (req, res) => {
  const sql = `SELECT sr.id, u.name, u.email, sr.request_msg, sr.status, sr.requested_at
               FROM salary_requests sr
               JOIN users u ON sr.user_id = u.id
               ORDER BY sr.requested_at DESC`;

  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    res.status(200).json(results);
  });
};


// ✅ Get own requests (Staff)
export const getMyRequests = (req, res) => {
  const userId = req.user.userId;

  const sql = `SELECT id, request_msg, status, requested_at FROM salary_requests WHERE user_id = ? ORDER BY requested_at DESC`;
  connection.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    res.status(200).json(results);
  });
};