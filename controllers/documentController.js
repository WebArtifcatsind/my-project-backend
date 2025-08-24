// controllers/documentController.js

import getConnection from "../models/db.js";

// ✅ Staff uploads document
export const uploadStaffDocument = async (req, res) => {
  const { userId, title } = req.body;
  // Get the Blob URL from the middleware
  const fileUrl = req.blobUrl || null;

  if (!userId || !title || !fileUrl) { // fileUrl is now essential
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `INSERT INTO staff_documents (user_id, title, file) VALUES (?, ?, ?)`;
  const values = [userId, title, fileUrl]; // Store the Blob URL

  try {
    const connection = await getConnection();
    const [result] = await connection.query(query, values);

    res.status(200).json({
      message: "Document uploaded successfully",
      document: {
        id: result.insertId,
        userId,
        title,
        file: fileUrl, // Return the Blob URL
        path: fileUrl // The path is now the URL
      }
    });
  } catch (err) {
    console.error("DB Error (uploadStaffDocument):", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// ✅ Admin views all staff uploads (No change needed here, it fetches from DB)
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

// ✅ Admin downloads staff document (REDIRECT to Blob URL)
export const downloadStaffDocument = async (req, res) => {
  const filename = decodeURIComponent(req.params.filename); // This `filename` needs to match the stored URL fragment

  try {
    const connection = await getConnection();
    // Query the database to find the document by its filename (or a unique ID)
    // You might need to adjust this query based on how you store and retrieve Blob URLs.
    // For simplicity, we'll assume the `file` column contains the full Blob URL.
    const [rows] = await connection.query(
      `SELECT file FROM staff_documents WHERE file LIKE ? LIMIT 1`,
      [`%${filename}`] // Use LIKE to match the filename part of the URL
    );

    if (rows.length === 0 || !rows[0].file) {
      console.error("Staff document not found in DB:", filename);
      return res.status(404).send("File not found in database or no URL stored.");
    }

    const fileUrl = rows[0].file;
    // Redirect the user's browser directly to the Vercel Blob URL
    res.redirect(fileUrl);

  } catch (err) {
    console.error("Download error (downloadStaffDocument):", err);
    return res.status(500).json({ error: "Failed to initiate download" });
  }
};

// ✅ Admin uploads document to clients
export const adminUploadToClient = async (req, res) => {
  const { userId, title } = req.body;
  // Get the Blob URL from the middleware
  const fileUrl = req.blobUrl || null;

  if (!userId || !title || !fileUrl) { // fileUrl is now essential
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `INSERT INTO admin_shared_documents (user_id, title, file) VALUES (?, ?, ?)`;
  const values = [userId, title, fileUrl]; // Store the Blob URL

  try {
    const connection = await getConnection();
    const [result] = await connection.query(query, values);
    
    res.status(200).json({
      message: "File shared with client successfully",
      document: {
        id: result.insertId,
        userId,
        title,
        file: fileUrl, // Return the Blob URL
        path: fileUrl // The path is now the URL
      }
    });
  } catch (err) {
    console.error("DB Error (adminUploadToClient):", err);
    return res.status(500).json({ error: "Database error", details: err });
  }
};

// ✅ Client downloads shared document (REDIRECT to Blob URL)
export const downloadClientDocument = async (req, res) => {
  const filename = decodeURIComponent(req.params.filename); // This `filename` needs to match the stored URL fragment

  try {
    const connection = await getConnection();
    // Query the database to find the document by its filename (or a unique ID)
    // For simplicity, we'll assume the `file` column contains the full Blob URL.
    const [rows] = await connection.query(
      `SELECT file FROM admin_shared_documents WHERE file LIKE ? LIMIT 1`,
      [`%${filename}`] // Use LIKE to match the filename part of the URL
    );

    if (rows.length === 0 || !rows[0].file) {
      console.error("Client document not found in DB:", filename);
      return res.status(404).send("File not found in database or no URL stored.");
    }

    const fileUrl = rows[0].file;
    // Redirect the user's browser directly to the Vercel Blob URL
    res.redirect(fileUrl);

  } catch (err) {
    console.error("Download error (downloadClientDocument):", err);
    return res.status(500).json({ error: "Failed to initiate download" });
  }
};














// // controllers/documentController.js

// import path from "path";
// import fs from "fs";
// import getConnection from "../models/db.js";

// // ✅ Staff uploads document
// export const uploadStaffDocument = async (req, res) => {
//   const { userId, title } = req.body;
//   const file = req.file ? req.file.filename : null;

//   if (!userId || !title || !file) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const query = `INSERT INTO staff_documents (user_id, title, file) VALUES (?, ?, ?)`;
//   const values = [userId, title, file];

//   try {
//     const connection = await getConnection();
//     const [result] = await connection.query(query, values);

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
//   } catch (err) {
//     console.error("DB Error (uploadStaffDocument):", err);
//     return res.status(500).json({ error: "Database error", details: err });
//   }
// };

// // ✅ Admin views all staff uploads
// export const getAllStaffDocuments = async (req, res) => {
//   const query = `SELECT * FROM staff_documents ORDER BY created_at DESC`;

//   try {
//     const connection = await getConnection();
//     const [results] = await connection.query(query);
//     res.status(200).json(results);
//   } catch (err) {
//     console.error("DB Error (getAllStaffDocuments):", err);
//     return res.status(500).json({ error: "Database error" });
//   }
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
// export const adminUploadToClient = async (req, res) => {
//   const { userId, title } = req.body;
//   const file = req.file ? req.file.filename : null;

//   if (!userId || !title || !file) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const query = `INSERT INTO admin_shared_documents (user_id, title, file) VALUES (?, ?, ?)`;
//   const values = [userId, title, file];

//   try {
//     const connection = await getConnection();
//     const [result] = await connection.query(query, values);
    
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
//   } catch (err) {
//     console.error("DB Error (adminUploadToClient):", err);
//     return res.status(500).json({ error: "Database error", details: err });
//   }
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
