// D:\office\webartifacts\web-backend\middleware\fileUpload.js

import multer from 'multer';
import { put } from '@vercel/blob';

// 1. Multer Memory Storage
// This is the universal Multer configuration. It processes files in memory
// as a Buffer (req.file.buffer), preventing any attempts to write to the local disk.
export const memoryUpload = multer({ storage: multer.memoryStorage() });

// 2. Vercel Blob Upload Middleware Factory
// This function returns an async middleware that uploads the file from memory
// to Vercel Blob storage. It takes a 'folderName' to organize your files in Blob.
export const uploadToBlob = (folderName) => async (req, res, next) => {
  // If no file was processed by Multer, skip this middleware.
  if (!req.file) {
    return next();
  }

  try {
    // Construct a unique filename and path within your Vercel Blob storage.
    // The folderName helps organize your uploaded files (e.g., 'complaints/').
    const filename = `${folderName}/${Date.now()}_${req.file.originalname}`;
    
    // Upload the file buffer (from req.file.buffer) to Vercel Blob.
    // 'access: public' makes the file accessible via a public URL.
    const blob = await put(filename, req.file.buffer, {
      access: 'public',
    });
    
    // Attach the public URL returned by Vercel Blob to the request object.
    // Your controllers can then access this URL via `req.blobUrl`.
    req.blobUrl = blob.url;

    // Proceed to the next middleware or the route handler (controller).
    next();
  } catch (err) {
    // Log and handle any errors that occur during the Blob upload process.
    console.error(`Vercel Blob upload error to folder ${folderName}:`, err);
    return res.status(500).json({ error: `Failed to upload file to Vercel Blob` });
  }
};

// 3. Export specific multer instances for clarity in routes.
// All these exports now use memoryUpload, ensuring no disk writes.
export const upload = memoryUpload;         // For general uploads (e.g., complaints)
export const salaryUpload = memoryUpload;   // For salary slips
export const trainingUpload = memoryUpload; // For training materials
export const staffUpload = memoryUpload;    // For staff-uploaded documents
export const toClientsUpload = memoryUpload; // For admin-uploaded documents to clients













// // middleware/fileUpload.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Utility to create folders if missing
// const ensureFolderExists = (folderPath) => {
//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath, { recursive: true });
//   }
// };

// // 🔹 1. Complaint Upload
// const complaintDir = path.resolve("uploads/complaints");
// ensureFolderExists(complaintDir);

// const complaintStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, complaintDir),
//   filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
// });

// export const upload = multer({ storage: complaintStorage });

// // 🔹 2. Salary Slip Upload
// const salaryDir = path.resolve("uploads/salaryslips");
// ensureFolderExists(salaryDir);

// const salaryStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, salaryDir),
//   filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
// });

// export const salaryUpload = multer({ storage: salaryStorage });

// // 🔹 3. Training Module Upload
// const trainingDir = path.resolve("uploads/training");
// ensureFolderExists(trainingDir);

// const trainingStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, trainingDir),
//   filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
// });

// export const trainingUpload = multer({ storage: trainingStorage });

// // 🔹 4. Staff Upload Documents
// const staffDir = path.resolve("uploads/fromStaff");
// ensureFolderExists(staffDir);

// const staffStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, staffDir),
//   filename: (req, file, cb) => {
//     const sanitized = file.originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
//     cb(null, `${Date.now()}_${sanitized}`);
//   },
// });

// export const staffUpload = multer({ storage: staffStorage });





// // 🔹 6. Admin Upload to Clients
// const toClientsDir = path.resolve("uploads/toClients");
// ensureFolderExists(toClientsDir);

// const toClientsStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, toClientsDir),
//   filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
// });

// export const toClientsUpload = multer({ storage: toClientsStorage });
















// // 🔹 5. Feedback Upload

// const feedbackDir = path.resolve("uploads/feedback");
// ensureFolderExists(feedbackDir);

// const feedbackStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, feedbackDir),
//   filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
// });

// export const feedbackUpload = multer({ storage: feedbackStorage });
