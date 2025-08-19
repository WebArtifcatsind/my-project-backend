// // controllers/authController.js


// controllers/authController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getConnection from "../models/db.js"; // Corrected import
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

// ✅ Register User (Admin Only)
export const registerUser = async (req, res) => {
  const { name, email, password, role, requesterRole } = req.body;

  if (requesterRole !== "admin") {
    return res.status(403).json({ message: "Access denied." });
  }

  const checkQuery = `SELECT * FROM users WHERE email = ?`;
  try {
    const connection = await getConnection();
    const [results] = await connection.query(checkQuery, [email]);

    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;

    await connection.query(insertQuery, [name, email, hashedPassword, role]);
    return res.status(201).json({ message: "User registered successfully!" });

  } catch (err) {
    console.error("Database error (registerUser):", err);
    return res.status(500).json({ message: "DB error", error: err });
  }
};

// ✅ Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM users WHERE email = ?`;
  try {
    const connection = await getConnection();
    const [results] = await connection.query(sql, [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Database error (loginUser):", err);
    return res.status(500).json({ message: "DB error" });
  }
};

// ✅ Forgot Password: Send OTP
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now

  try {
    const connection = await getConnection();
    const updateQuery = `UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?`;
    const [result] = await connection.query(updateQuery, [otp, expiry, email]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.EMAIL_CLIENT_ID,
        clientSecret: process.env.EMAIL_CLIENT_SECRET,
        refreshToken: process.env.EMAIL_REFRESH_TOKEN,
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "WebArtifacts - OTP for Password Reset",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Nodemailer error:", error);
        return res.status(500).json({ message: "Failed to send email", error: error.message });
      }
      return res.status(200).json({ message: "OTP sent to email." });
    });

  } catch (err) {
    console.error("Database or Nodemailer error:", err);
    return res.status(500).json({ message: "An unexpected error occurred." });
  }
};

// ✅ Verify OTP
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const query = `SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expiry > NOW()`;

  try {
    const connection = await getConnection();
    const [results] = await connection.query(query, [email, otp]);

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    return res.status(200).json({ message: "OTP verified." });
  } catch (err) {
    console.error("Database error (verifyOTP):", err);
    return res.status(500).json({ message: "DB error" });
  }
};

// ✅ Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const connection = await getConnection();

  // First verify the OTP is valid and not expired
  const verifyQuery = `SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expiry > NOW()`;

  try {
    const [results] = await connection.query(verifyQuery, [email, otp]);

    if (results.length === 0) {
      return res.status(400).json({ 
        message: "Invalid or expired OTP. Please request a new OTP." 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updateQuery = `
      UPDATE users 
      SET password = ?, otp = NULL, otp_expiry = NULL 
      WHERE email = ?
    `;
    
    const [updateResult] = await connection.query(updateQuery, [hashedPassword, email]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ 
      success: true,
      message: "Password reset successfully!" 
    });

  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({ message: "Error processing password" });
  }
};

// ✅ Test Route
export const testRoute = (req, res) => {
  res.send("✅ Auth Controller is working fine!");
};









// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import connection from "../models/db.js";
// import dotenv from "dotenv";
// import nodemailer from "nodemailer";
// dotenv.config();

// // ✅ Register User (Admin Only)
// export const registerUser = (req, res) => {
//   const { name, email, password, role, requesterRole } = req.body;

//   if (requesterRole !== "admin") {
//     return res.status(403).json({ message: "Access denied." });
//   }

//   const checkQuery = `SELECT * FROM users WHERE email = ?`;
//   connection.query(checkQuery, [email], async (err, results) => {
//     if (results?.length > 0) {
//       return res.status(409).json({ message: "User already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const insertQuery = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;

//     connection.query(insertQuery, [name, email, hashedPassword, role], (err) => {
//       if (err) return res.status(500).json({ message: "DB error", error: err });
//       return res.status(201).json({ message: "User registered successfully!" });
//     });
//   });
// };

// // ✅ Login User
// export const loginUser = (req, res) => {
//   const { email, password } = req.body;

//   const sql = `SELECT * FROM users WHERE email = ?`;
//   connection.query(sql, [email], async (err, results) => {
//     if (err || results.length === 0) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const user = results[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { userId: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "2h" }
//     );

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: { id: user.id, name: user.name, email: user.email, role: user.role },
//     });
//   });
// };

// // ✅ Forgot Password: Send OTP
// export const forgotPassword = (req, res) => {
//   const { email } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now

//   const updateQuery = `UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?`;
//   connection.query(updateQuery, [otp, expiry, email], (err, result) => {
//     if (err || result.affectedRows === 0) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Corrected Nodemailer configuration to use OAuth2
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: process.env.EMAIL_USER,
//         clientId: process.env.EMAIL_CLIENT_ID,
//         clientSecret: process.env.EMAIL_CLIENT_SECRET,
//         refreshToken: process.env.EMAIL_REFRESH_TOKEN,
//       }
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "WebArtifacts - OTP for Password Reset",
//       text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         // Log the full error for better debugging
//         console.error("Nodemailer error:", error);
//         return res.status(500).json({ message: "Failed to send email", error: error.message });
//       }
//       return res.status(200).json({ message: "OTP sent to email." });
//     });
//   });
// };

// // ✅ Verify OTP
// export const verifyOTP = (req, res) => {
//   const { email, otp } = req.body;
//   const query = `SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expiry > NOW()`;

//   connection.query(query, [email, otp], (err, results) => {
//     if (err || results.length === 0) {
//       return res.status(400).json({ message: "Invalid or expired OTP." });
//     }

//     return res.status(200).json({ message: "OTP verified." });
//   });
// };

// // ✅ Reset Password (Fixed Version)
// export const resetPassword = async (req, res) => {
//   const { email, otp, newPassword } = req.body;

//   // First verify the OTP is valid and not expired
//   const verifyQuery = `SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expiry > NOW()`;
//   
//   connection.query(verifyQuery, [email, otp], async (err, results) => {
//     if (err) {
//       console.error("Database error during OTP verification:", err);
//       return res.status(500).json({ message: "Database error during OTP verification" });
//     }

//     if (results.length === 0) {
//       return res.status(400).json({ 
//         message: "Invalid or expired OTP. Please request a new OTP." 
//       });
//     }

//     try {
//       // Hash the new password
//       const hashedPassword = await bcrypt.hash(newPassword, 10);
//       
//       // Update password and clear OTP fields
//       const updateQuery = `
//         UPDATE users 
//         SET password = ?, otp = NULL, otp_expiry = NULL 
//         WHERE email = ?
//       `;
//       
//       connection.query(updateQuery, [hashedPassword, email], (updateErr, updateResult) => {
//         if (updateErr) {
//           console.error("Database error during password update:", updateErr);
//           return res.status(500).json({ message: "Failed to update password" });
//         }

//         if (updateResult.affectedRows === 0) {
//           return res.status(404).json({ message: "User not found" });
//         }

//         return res.status(200).json({ 
//           success: true,
//           message: "Password reset successfully!" 
//         });
//       });
//     } catch (hashError) {
//       console.error("Password hashing error:", hashError);
//       return res.status(500).json({ message: "Error processing password" });
//     }
//   });
// };

// // ✅ Test Route
// export const testRoute = (req, res) => {
//   res.send("✅ Auth Controller is working fine!");
// };