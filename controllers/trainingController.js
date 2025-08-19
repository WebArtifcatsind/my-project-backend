
//D:\office\webartifacts\web-backend\controllers\trainingController.js
import path from "path";
import fs from "fs";
import connection from "../models/db.js";


// 📤 Upload training material
export const uploadTraining = (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filename = file.filename;
  const filePath = path.join("uploads/training/", filename);

  const sql = "INSERT INTO training_materials (filename, path) VALUES (?, ?)";
  connection.query(sql, [filename, filePath], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", err });

    return res.status(200).json({ message: "Training material uploaded successfully", file: filename });
  });
};

// 📥 Get all uploaded training materials
export const getTrainingMaterials = (req, res) => {
  const sql = "SELECT * FROM training_materials";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", err });
    return res.status(200).json(results);
  });
};



export const deleteTrainingMaterial = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { id } = req.params;

  // First, get the filename to delete from filesystem
  const getQuery = "SELECT filename FROM training_materials WHERE id = ?";
  connection.query(getQuery, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "Training file not found" });
    }

    const filePath = path.resolve("uploads/training", results[0].filename);

    // Delete from DB
    const deleteQuery = "DELETE FROM training_materials WHERE id = ?";
    connection.query(deleteQuery, [id], (err2) => {
      if (err2) return res.status(500).json({ message: "Database error", error: err2 });

      // Delete file from disk
      fs.unlink(filePath, (fsErr) => {
        if (fsErr) {
          console.warn("⚠️ File missing on disk:", filePath);
        }
        return res.status(200).json({ message: "Training material deleted" });
      });
    });
  });
};

