

// D:\office\webartifacts\web-backend\controllers\trainingController.js

// Removed local file system modules:
// import path from "path";
// import fs from "fs";
import { del } from "@vercel/blob";
import getConnection from "../models/db.js";

// ✅ Upload training material
export const uploadTraining = async (req, res) => {
  // Get the Blob URL from the middleware
  const fileUrl = req.blobUrl;
  
  if (!fileUrl) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // The filename is now part of the URL, so we can store the full URL
  const sql = "INSERT INTO training_materials (filename, path) VALUES (?, ?)";

  try {
    const connection = await getConnection();
    await connection.query(sql, [fileUrl, fileUrl]); // Store the Vercel Blob URL
    return res.status(200).json({ 
      message: "Training material uploaded successfully", 
      file: fileUrl 
    });
  } catch (err) {
    console.error("Database error (uploadTraining):", err);
    return res.status(500).json({ error: "Database error", err });
  }
};

// ✅ Get all uploaded training materials
export const getTrainingMaterials = async (req, res) => {
  const sql = "SELECT * FROM training_materials";
  
  try {
    const connection = await getConnection();
    const [results] = await connection.query(sql);
    return res.status(200).json(results);
  } catch (err) {
    console.error("Database error (getTrainingMaterials):", err);
    return res.status(500).json({ error: "Database error", err });
  }
};

// ✅ Delete training material from both DB and Vercel Blob
export const deleteTrainingMaterial = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { id } = req.params;

  try {
    const connection = await getConnection();
    
    // First, get the Blob URL from the database
    const getQuery = "SELECT filename FROM training_materials WHERE id = ?";
    const [results] = await connection.query(getQuery, [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Training file not found" });
    }

    const fileUrl = results[0].filename;

    // Delete the file from Vercel Blob
    await del(fileUrl);
    
    // Delete the entry from the database
    const deleteQuery = "DELETE FROM training_materials WHERE id = ?";
    await connection.query(deleteQuery, [id]);

    return res.status(200).json({ message: "Training material deleted" });

  } catch (err) {
    console.error("Error deleting training material:", err);
    return res.status(500).json({ message: "An error occurred during deletion", error: err });
  }
};












// // controllers/trainingController.js

// import path from "path";
// import fs from "fs";
// import getConnection from "../models/db.js";

// // 📤 Upload training material
// export const uploadTraining = async (req, res) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   const filename = file.filename;
//   const filePath = path.join("uploads/training/", filename);

//   const sql = "INSERT INTO training_materials (filename, path) VALUES (?, ?)";

//   try {
//     const connection = await getConnection();
//     await connection.query(sql, [filename, filePath]);
//     return res.status(200).json({ message: "Training material uploaded successfully", file: filename });
//   } catch (err) {
//     console.error("Database error (uploadTraining):", err);
//     return res.status(500).json({ error: "Database error", err });
//   }
// };

// // 📥 Get all uploaded training materials
// export const getTrainingMaterials = async (req, res) => {
//   const sql = "SELECT * FROM training_materials";
  
//   try {
//     const connection = await getConnection();
//     const [results] = await connection.query(sql);
//     return res.status(200).json(results);
//   } catch (err) {
//     console.error("Database error (getTrainingMaterials):", err);
//     return res.status(500).json({ error: "Database error", err });
//   }
// };


// export const deleteTrainingMaterial = async (req, res) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "Access denied" });
//   }

//   const { id } = req.params;

//   try {
//     const connection = await getConnection();
    
//     // First, get the filename to delete from filesystem
//     const getQuery = "SELECT filename FROM training_materials WHERE id = ?";
//     const [results] = await connection.query(getQuery, [id]);

//     if (results.length === 0) {
//       return res.status(404).json({ message: "Training file not found" });
//     }

//     const filePath = path.resolve("uploads/training", results[0].filename);

//     // Delete from DB
//     const deleteQuery = "DELETE FROM training_materials WHERE id = ?";
//     await connection.query(deleteQuery, [id]);

//     // Delete file from disk
//     fs.unlink(filePath, (fsErr) => {
//       if (fsErr) {
//         console.warn("⚠️ File missing on disk:", filePath);
//       }
//       return res.status(200).json({ message: "Training material deleted" });
//     });

//   } catch (err) {
//     console.error("Database error (deleteTrainingMaterial):", err);
//     return res.status(500).json({ message: "Database error", error: err });
//   }
// };






// //D:\office\webartifacts\web-backend\controllers\trainingController.js
// import path from "path";
// import fs from "fs";
// import connection from "../models/db.js";


// // 📤 Upload training material
// export const uploadTraining = (req, res) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   const filename = file.filename;
//   const filePath = path.join("uploads/training/", filename);

//   const sql = "INSERT INTO training_materials (filename, path) VALUES (?, ?)";
//   connection.query(sql, [filename, filePath], (err, result) => {
//     if (err) return res.status(500).json({ error: "Database error", err });

//     return res.status(200).json({ message: "Training material uploaded successfully", file: filename });
//   });
// };

// // 📥 Get all uploaded training materials
// export const getTrainingMaterials = (req, res) => {
//   const sql = "SELECT * FROM training_materials";
//   connection.query(sql, (err, results) => {
//     if (err) return res.status(500).json({ error: "Database error", err });
//     return res.status(200).json(results);
//   });
// };



// export const deleteTrainingMaterial = (req, res) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "Access denied" });
//   }

//   const { id } = req.params;

//   // First, get the filename to delete from filesystem
//   const getQuery = "SELECT filename FROM training_materials WHERE id = ?";
//   connection.query(getQuery, [id], (err, results) => {
//     if (err || results.length === 0) {
//       return res.status(404).json({ message: "Training file not found" });
//     }

//     const filePath = path.resolve("uploads/training", results[0].filename);

//     // Delete from DB
//     const deleteQuery = "DELETE FROM training_materials WHERE id = ?";
//     connection.query(deleteQuery, [id], (err2) => {
//       if (err2) return res.status(500).json({ message: "Database error", error: err2 });

//       // Delete file from disk
//       fs.unlink(filePath, (fsErr) => {
//         if (fsErr) {
//           console.warn("⚠️ File missing on disk:", filePath);
//         }
//         return res.status(200).json({ message: "Training material deleted" });
//       });
//     });
//   });
// };

