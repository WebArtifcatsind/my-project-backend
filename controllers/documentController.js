

// controllers/documentController.js

import path from "path";
import fs from "fs";
import getConnection from "../models/db.js";

// ✅ Staff uploads document
export const uploadStaffDocument = async (req, res) => {
  const { userId, title } = req.body;
  const file = req.file ? req.file.filename : null;

  if (!userId || !title || !file) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `INSERT INTO staff_documents (user_id, title, file) VALUES (?, ?, ?)`;
  const values = [userId, title, file];

  try {
    const connection = await getConnection();
    const [result] = await connection.query(query, values);

    res.status(200).json({
      message: "Document uploaded successfully",
      document: {
        id: result.insertId,
        userId,
        title,
        file,
        path: `/uploads/fromStaff/${file}`
      }
    });
  } catch (err) {
    console.error("DB Error (uploadStaffDocument):", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// ✅ Admin views all staff uploads
export const getAllStaffDocuments = async (req, res) => {
  const query = `SELECT * FROM staff_documents ORDER BY created_at DESC`;

  try {
    const connection = await getConnection();
    const [results] = await connection.query(query);
    res.status(200).json(results);
  } catch (err) {
    console.error("DB Error (getAllStaffDocuments):", err);
    return res.status(500).json({ error: "Database error" });
  }
};

// ✅ Admin downloads staff document (supports special characters)
export const downloadStaffDocument = (req, res) => {
  const decodedFilename = decodeURIComponent(req.params.filename);
  const filePath = path.resolve("uploads/fromStaff", decodedFilename);

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return res.status(404).send("File not found");
  }

  res.download(filePath, decodedFilename, (err) => {
    if (err) {
      console.error("Download error:", err);
      return res.status(500).json({ error: "Download failed" });
    }
  });
};

// ✅ Admin uploads document to clients
export const adminUploadToClient = async (req, res) => {
  const { userId, title } = req.body;
  const file = req.file ? req.file.filename : null;

  if (!userId || !title || !file) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `INSERT INTO admin_shared_documents (user_id, title, file) VALUES (?, ?, ?)`;
  const values = [userId, title, file];

  try {
    const connection = await getConnection();
    const [result] = await connection.query(query, values);
    
    res.status(200).json({
      message: "File shared with client successfully",
      document: {
        id: result.insertId,
        userId,
        title,
        file,
        path: `/uploads/toClients/${file}`
      }
    });
  } catch (err) {
    console.error("DB Error (adminUploadToClient):", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// ✅ Client downloads shared document (supports special characters)
export const downloadClientDocument = (req, res) => {
  const decodedFilename = decodeURIComponent(req.params.filename);
  const filePath = path.resolve("uploads/toClients", decodedFilename);

  if (!fs.existsSync(filePath)) {
    console.error("Client file not found:", filePath);
    return res.status(404).send("File not found");
  }

  res.download(filePath, decodedFilename, (err) => {
    if (err) {
      console.error("Download error:", err);
      return res.status(500).json({ error: "Download failed" });
    }
  });
};






// import path from "path";
// import fs from "fs";
// import connection from "../models/db.js";

// // ✅ Staff uploads document
// export const uploadStaffDocument = (req, res) => {
//   const { userId, title } = req.body;
//   const file = req.file ? req.file.filename : null;

//   if (!userId || !title || !file) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const query = `INSERT INTO staff_documents (user_id, title, file) VALUES (?, ?, ?)`;
//   const values = [userId, title, file];

//   connection.query(query, values, (err, result) => {
//     if (err) {
//       console.error("DB Error (uploadStaffDocument):", err);
//       return res.status(500).json({ error: "Database error", details: err });
//     }

//     res.status(200).json({
//       message: "Document uploaded successfully",
//       document: {
//         id: result.insertId,
//         userId,
//         title,
//         file,
//         path: `/uploads/fromStaff/${file}`
//       }
//     });
//   });
// };

// // ✅ Admin views all staff uploads
// export const getAllStaffDocuments = (req, res) => {
//   const query = `SELECT * FROM staff_documents ORDER BY created_at DESC`;

//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("DB Error (getAllStaffDocuments):", err);
//       return res.status(500).json({ error: "Database error" });
//     }

//     res.status(200).json(results);
//   });
// };

// // ✅ Admin downloads staff document (supports special characters)
// export const downloadStaffDocument = (req, res) => {
//   const decodedFilename = decodeURIComponent(req.params.filename);
//   const filePath = path.resolve("uploads/fromStaff", decodedFilename);

//   if (!fs.existsSync(filePath)) {
//     console.error("File not found:", filePath);
//     return res.status(404).send("File not found");
//   }

//   res.download(filePath, decodedFilename, (err) => {
//     if (err) {
//       console.error("Download error:", err);
//       return res.status(500).json({ error: "Download failed" });
//     }
//   });
// };

// // ✅ Admin uploads document to clients
// export const adminUploadToClient = (req, res) => {
//   const { userId, title } = req.body;
//   const file = req.file ? req.file.filename : null;

//   if (!userId || !title || !file) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const query = `INSERT INTO admin_shared_documents (user_id, title, file) VALUES (?, ?, ?)`;
//   const values = [userId, title, file];

//   connection.query(query, values, (err, result) => {
//     if (err) {
//       console.error("DB Error (adminUploadToClient):", err);
//       return res.status(500).json({ error: "Database error", details: err });
//     }

//     res.status(200).json({
//       message: "File shared with client successfully",
//       document: {
//         id: result.insertId,
//         userId,
//         title,
//         file,
//         path: `/uploads/toClients/${file}`
//       }
//     });
//   });
// };

// // ✅ Client downloads shared document (supports special characters)
// export const downloadClientDocument = (req, res) => {
//   const decodedFilename = decodeURIComponent(req.params.filename);
//   const filePath = path.resolve("uploads/toClients", decodedFilename);

//   if (!fs.existsSync(filePath)) {
//     console.error("Client file not found:", filePath);
//     return res.status(404).send("File not found");
//   }

//   res.download(filePath, decodedFilename, (err) => {
//     if (err) {
//       console.error("Download error:", err);
//       return res.status(500).json({ error: "Download failed" });
//     }
//   });
// };
