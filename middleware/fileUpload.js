// middleware/fileUpload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Utility to create folders if missing
const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// 🔹 1. Complaint Upload
const complaintDir = path.resolve("uploads/complaints");
ensureFolderExists(complaintDir);

const complaintStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, complaintDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

export const upload = multer({ storage: complaintStorage });

// 🔹 2. Salary Slip Upload
const salaryDir = path.resolve("uploads/salaryslips");
ensureFolderExists(salaryDir);

const salaryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, salaryDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

export const salaryUpload = multer({ storage: salaryStorage });

// 🔹 3. Training Module Upload
const trainingDir = path.resolve("uploads/training");
ensureFolderExists(trainingDir);

const trainingStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, trainingDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

export const trainingUpload = multer({ storage: trainingStorage });

// 🔹 4. Staff Upload Documents
const staffDir = path.resolve("uploads/fromStaff");
ensureFolderExists(staffDir);

const staffStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, staffDir),
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
    cb(null, `${Date.now()}_${sanitized}`);
  },
});

export const staffUpload = multer({ storage: staffStorage });





// 🔹 6. Admin Upload to Clients
const toClientsDir = path.resolve("uploads/toClients");
ensureFolderExists(toClientsDir);

const toClientsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, toClientsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});

export const toClientsUpload = multer({ storage: toClientsStorage });






// // 🔹 5. Feedback Upload

// const feedbackDir = path.resolve("uploads/feedback");
// ensureFolderExists(feedbackDir);

// const feedbackStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, feedbackDir),
//   filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
// });

// export const feedbackUpload = multer({ storage: feedbackStorage });
