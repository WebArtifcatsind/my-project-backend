
// D:\office\webartifacts\web-backend\middleware\clientUpload.js

import { put } from '@vercel/blob';

// The middleware function now handles the file upload to Vercel Blob
const complaintUpload = async (req, res, next) => {
  // Check if a file was uploaded
  if (!req.file) {
    return next(); // No file was uploaded, so just move to the next middleware/controller
  }

  try {
    const filename = `complaints/${Date.now()}_${req.file.originalname}`;
    
    // Upload the file buffer to Vercel Blob
    const blob = await put(filename, req.file.buffer, {
      access: 'public', // Makes the file accessible via a public URL
    });
    
    // Attach the public URL of the uploaded file to the request object
    req.fileUrl = blob.url;
    next();
  } catch (err) {
    console.error("Vercel Blob upload error:", err);
    res.status(500).json({ error: "Failed to upload file to Vercel Blob" });
  }
};

export default complaintUpload;



// //D:\office\webartifacts\web-backend\middleware\clientUpload.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const complaintDir = path.resolve("uploads/complaints");
// if (!fs.existsSync(complaintDir)) fs.mkdirSync(complaintDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, complaintDir),
//   filename: (req, file, cb) => {
//     const uniqueName = `complaint_${Date.now()}_${file.originalname}`;
//     cb(null, uniqueName);
//   },
// });

// export const complaintUpload = multer({ storage });
