// controllers/salaryController.js

import getConnection from "../models/db.js";

// ✅ Upload Salary Slip (Admin only)
export const uploadSalarySlip = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admin can upload slips." });
  }
  
  const fileUrl = req.blobUrl; // Get the URL from the middleware
  const { userId } = req.body;

  if (!fileUrl || !userId) {
    return res.status(400).json({ message: "Missing file or user ID." });
  }

  const sql = `INSERT INTO salary_slips (user_id, file_path, uploaded_at) VALUES (?, ?, NOW())`;
  
  try {
    const connection = await getConnection();
    await connection.query(sql, [userId, fileUrl]);
    res.status(200).json({ message: "Salary slip uploaded successfully." });
  } catch (err) {
    console.error("DB error (uploadSalarySlip):", err);
    return res.status(500).json({ message: "DB error", err });
  }
};

// ✅ View salary slips (Staff)
export const getMySalarySlips = async (req, res) => {
  const userId = req.user.userId;

  const sql = `SELECT file_path, uploaded_at FROM salary_slips WHERE user_id = ? ORDER BY uploaded_at DESC`;

  try {
    const connection = await getConnection();
    const [results] = await connection.query(sql, [userId]);
    res.status(200).json(results);
  } catch (err) {
    console.error("DB error (getMySalarySlips):", err);
    return res.status(500).json({ message: "DB error", err });
  }
};

// ✅ Download endpoint (REDIRECT to Blob URL)
export const downloadSlip = async (req, res) => {
  const { filename } = req.params;
  
  // Find the file path (which is now a URL) in the database
  const sql = `SELECT file_path FROM salary_slips WHERE file_path LIKE ? LIMIT 1`;

  try {
    const connection = await getConnection();
    const [results] = await connection.query(sql, [`%${filename}`]);

    if (results.length === 0) {
      return res.status(404).json({ message: "File not found." });
    }

    const fileUrl = results[0].file_path;
    res.redirect(fileUrl); // Redirect the client to the Vercel Blob URL

  } catch (err) {
    console.error("Download error (downloadSlip):", err);
    return res.status(500).json({ message: "DB error", err });
  }
};

// ✅ Staff requests salary slip
export const requestSalarySlip = async (req, res) => {
  const userId = req.user?.id;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  if (!userId) return res.status(400).json({ message: "User ID missing" });

  const query = `
    SELECT * FROM salary_slips 
    WHERE user_id = ? AND MONTH(uploaded_at) = ? AND YEAR(uploaded_at) = ?
  `;

  try {
    const connection = await getConnection();
    const [results] = await connection.query(query, [userId, currentMonth, currentYear]);

    if (results.length === 0) {
      return res.status(404).json({ message: "No salary slip found for this month." });
    }

    res.status(200).json({
      message: "Salary slip is ready for download.",
      slip: results[0],
    });
  } catch (err) {
    console.error("Error fetching salary slip:", err);
    return res.status(500).json({ message: "Database error" });
  }
};

// ✅ Admin views all salary requests
export const viewSalaryRequests = async (req, res) => {
  const sql = `SELECT sr.id, u.name, u.email, sr.request_msg, sr.status, sr.requested_at
                FROM salary_requests sr
                JOIN users u ON sr.user_id = u.id
                ORDER BY sr.requested_at DESC`;

  try {
    const connection = await getConnection();
    const [results] = await connection.query(sql);
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ message: "DB error", err });
  }
};

// ✅ Get own requests (Staff)
export const getMyRequests = async (req, res) => {
  const userId = req.user.userId;

  const sql = `SELECT id, request_msg, status, requested_at FROM salary_requests WHERE user_id = ? ORDER BY requested_at DESC`;
  
  try {
    const connection = await getConnection();
    const [results] = await connection.query(sql, [userId]);
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ message: "DB error", err });
  }
};





















// // controllers/salaryController.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import getConnection from "../models/db.js";

// // 📁 Ensure uploads/salaryslips exists
// const salaryDir = path.resolve("uploads/salaryslips");
// if (!fs.existsSync(salaryDir)) fs.mkdirSync(salaryDir, { recursive: true });

// // 📦 Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, salaryDir),
//   filename: (req, file, cb) => {
//     const userId = req.body.userId;
//     const ext = path.extname(file.originalname);
//     cb(null, `${userId}_${Date.now()}${ext}`);
//   },
// });
// export const upload = multer({ storage });

// // ✅ Upload Salary Slip (Admin only)
// export const uploadSalarySlip = async (req, res) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "Only admin can upload slips." });
//   }

//   const file = req.file;
//   const { userId } = req.body;

//   const sql = `INSERT INTO salary_slips (user_id, file_path, uploaded_at) VALUES (?, ?, NOW())`;
  
//   try {
//     const connection = await getConnection();
//     await connection.query(sql, [userId, file.filename]);
//     res.status(200).json({ message: "Salary slip uploaded successfully." });
//   } catch (err) {
//     return res.status(500).json({ message: "DB error", err });
//   }
// };

// // ✅ View salary slips (Staff)
// export const getMySalarySlips = async (req, res) => {
//   const userId = req.user.userId;

//   const sql = `SELECT file_path, uploaded_at FROM salary_slips WHERE user_id = ? ORDER BY uploaded_at DESC`;

//   try {
//     const connection = await getConnection();
//     const [results] = await connection.query(sql, [userId]);
//     res.status(200).json(results);
//   } catch (err) {
//     return res.status(500).json({ message: "DB error", err });
//   }
// };

// // ✅ Download endpoint (serves file)
// export const downloadSlip = (req, res) => {
//   const { filename } = req.params;
//   const filePath = path.join(salaryDir, filename);
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ message: "File not found" });
//   }
//   res.download(filePath);
// };

// // ✅ Staff requests salary slip
// export const requestSalarySlip = async (req, res) => {
//   const userId = req.user?.id;
//   const currentMonth = new Date().getMonth() + 1;
//   const currentYear = new Date().getFullYear();

//   if (!userId) return res.status(400).json({ message: "User ID missing" });

//   const query = `
//     SELECT * FROM salary_slips 
//     WHERE user_id = ? AND MONTH(uploaded_at) = ? AND YEAR(uploaded_at) = ?
//   `;

//   try {
//     const connection = await getConnection();
//     const [results] = await connection.query(query, [userId, currentMonth, currentYear]);

//     if (results.length === 0) {
//       return res.status(404).json({ message: "No salary slip found for this month." });
//     }

//     res.status(200).json({
//       message: "Salary slip is ready for download.",
//       slip: results[0],
//     });
//   } catch (err) {
//     console.error("Error fetching salary slip:", err);
//     return res.status(500).json({ message: "Database error" });
//   }
// };

// // ✅ Admin views all salary requests
// export const viewSalaryRequests = async (req, res) => {
//   const sql = `SELECT sr.id, u.name, u.email, sr.request_msg, sr.status, sr.requested_at
//                 FROM salary_requests sr
//                 JOIN users u ON sr.user_id = u.id
//                 ORDER BY sr.requested_at DESC`;

//   try {
//     const connection = await getConnection();
//     const [results] = await connection.query(sql);
//     res.status(200).json(results);
//   } catch (err) {
//     return res.status(500).json({ message: "DB error", err });
//   }
// };

// // ✅ Get own requests (Staff)
// export const getMyRequests = async (req, res) => {
//   const userId = req.user.userId;

//   const sql = `SELECT id, request_msg, status, requested_at FROM salary_requests WHERE user_id = ? ORDER BY requested_at DESC`;
  
//   try {
//     const connection = await getConnection();
//     const [results] = await connection.query(sql, [userId]);
//     res.status(200).json(results);
//   } catch (err) {
//     return res.status(500).json({ message: "DB error", err });
//   }
// };










// // controllers/salaryController.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import connection from "../models/db.js";

// // 📁 Ensure uploads/salaryslips exists
// const salaryDir = path.resolve("uploads/salaryslips");
// if (!fs.existsSync(salaryDir)) fs.mkdirSync(salaryDir, { recursive: true });

// // 📦 Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, salaryDir),
//   filename: (req, file, cb) => {
//     const userId = req.body.userId;
//     const ext = path.extname(file.originalname);
//     cb(null, `${userId}_${Date.now()}${ext}`);
//   },
// });
// export const upload = multer({ storage });

// // ✅ Upload Salary Slip (Admin only)
// export const uploadSalarySlip = (req, res) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "Only admin can upload slips." });
//   }

//   const file = req.file;
//   const { userId } = req.body;

//   const sql = `INSERT INTO salary_slips (user_id, file_path, uploaded_at) VALUES (?, ?, NOW())`;
//   connection.query(sql, [userId, file.filename], (err) => {
//     if (err) return res.status(500).json({ message: "DB error", err });
//     res.status(200).json({ message: "Salary slip uploaded successfully." });
//   });
// };

// // ✅ View salary slips (Staff)
// export const getMySalarySlips = (req, res) => {
//   const userId = req.user.userId;

//   const sql = `SELECT file_path, uploaded_at FROM salary_slips WHERE user_id = ? ORDER BY uploaded_at DESC`;
//   connection.query(sql, [userId], (err, results) => {
//     if (err) return res.status(500).json({ message: "DB error", err });
//     res.status(200).json(results);
//   });
// };

// // ✅ Download endpoint (serves file)
// export const downloadSlip = (req, res) => {
//   const { filename } = req.params;
//   const filePath = path.join(salaryDir, filename);
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ message: "File not found" });
//   }
//   res.download(filePath);
// };

// // ✅ Staff requests salary slip
// export const requestSalarySlip = (req, res) => {
//   const userId = req.user?.id;
//   const currentMonth = new Date().getMonth() + 1;
//   const currentYear = new Date().getFullYear();

//   if (!userId) return res.status(400).json({ message: "User ID missing" });

//   const query = `
//     SELECT * FROM salary_slips 
//     WHERE staff_id = ? AND MONTH(slip_date) = ? AND YEAR(slip_date) = ?
//   `;

//   connection.query(query, [userId, currentMonth, currentYear], (err, results) => {
//     if (err) {
//       console.error("Error fetching salary slip:", err);
//       return res.status(500).json({ message: "Database error" });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: "No salary slip found for this month." });
//     }

//     res.status(200).json({
//       message: "Salary slip is ready for download.",
//       slip: results[0],
//     });
//   });
// };

// // ✅ Admin views all salary requests
// export const viewSalaryRequests = (req, res) => {
//   const sql = `SELECT sr.id, u.name, u.email, sr.request_msg, sr.status, sr.requested_at
//                FROM salary_requests sr
//                JOIN users u ON sr.user_id = u.id
//                ORDER BY sr.requested_at DESC`;

//   connection.query(sql, (err, results) => {
//     if (err) return res.status(500).json({ message: "DB error", err });
//     res.status(200).json(results);
//   });
// };


// // ✅ Get own requests (Staff)
// export const getMyRequests = (req, res) => {
//   const userId = req.user.userId;

//   const sql = `SELECT id, request_msg, status, requested_at FROM salary_requests WHERE user_id = ? ORDER BY requested_at DESC`;
//   connection.query(sql, [userId], (err, results) => {
//     if (err) return res.status(500).json({ message: "DB error", err });
//     res.status(200).json(results);
//   });
// };