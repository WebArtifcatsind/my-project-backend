


//D:\office\webartifacts\web-backend\controllers\attendanceController.js

// ✅ Import the promise-based connection function
import getConnection from "../models/db.js";

// ✅ IT Staff marks attendance (only between 10:00 - 10:30 AM)
export const markAttendance = async (req, res) => {
  const userId = req.user?.userId;
  const status = "Present";

  if (!userId) {
    return res.status(400).json({ message: "User not authenticated" });
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const today = now.toISOString().split("T")[0];

  if (currentTime < 600 || currentTime > 630) {
    return res.status(403).json({
      message: "⛔ Attendance allowed only between 10:00 and 10:30 AM",
    });
  }

  const query = `
    INSERT INTO attendance (user_id, date, status)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE status = ?
  `;

  try {
    const connection = await getConnection();
    await connection.query(query, [userId, today, status, status]);
    res.status(200).json({ message: "✅ Attendance marked successfully" });
  } catch (err) {
    return res.status(500).json({ message: "❌ DB Error", error: err });
  }
};

// ✅ Admin updates attendance
export const updateAttendance = async (req, res) => {
  const { userId, date, status } = req.body;

  if (!userId || !date || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO attendance (user_id, date, status)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE status = ?
  `;

  try {
    const connection = await getConnection();
    await connection.query(query, [userId, date, status, status]);

    const fetchQuery = `SELECT * FROM attendance WHERE user_id = ? AND date = ?`;
    const [results] = await connection.query(fetchQuery, [userId, date]);
    res.status(200).json({ message: "Attendance updated", updated: results });
  } catch (err) {
    console.error("❌ MySQL Error:", err);
    return res.status(500).json({ error: "DB Error", details: err });
  }
};

// ✅ Admin views all attendance (optionally filter by date)
export const getAttendanceByDate = async (req, res) => {
  const { date } = req.query;

  const query = date
    ? `SELECT * FROM attendance WHERE date = ?`
    : `SELECT * FROM attendance ORDER BY date DESC`;

  try {
    const connection = await getConnection();
    const [results] = await connection.query(query, date ? [date] : []);
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: "DB Error", err });
  }
};

// ✅ Staff views their own attendance
export const getMyAttendance = async (req, res) => {
  const userId = req.user?.userId;
  const query = `
    SELECT * FROM attendance
    WHERE user_id = ?
    ORDER BY date DESC
  `;

  try {
    const connection = await getConnection();
    const [results] = await connection.query(query, [userId]);
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: "DB Error", err });
  }
};

// ✅ Admin views attendance of a specific user (all or filtered by month/year)
export const getAttendanceByUser = async (req, res) => {
  const userId = req.params.id;
  const { month, year } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing user ID" });
  }

  let query;
  let params;

  if (month && year) {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

    query = `
      SELECT * FROM attendance
      WHERE user_id = ? AND date BETWEEN ? AND ?
      ORDER BY date ASC
    `;
    params = [userId, startDate, endDate];
  } else {
    query = `
      SELECT * FROM attendance
      WHERE user_id = ?
      ORDER BY date DESC
    `;
    params = [userId];
  }

  try {
    const connection = await getConnection();
    const [results] = await connection.query(query, params);
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: "DB Error", err });
  }
};








// import connection from "../models/db.js";

// // ✅ IT Staff marks attendance (only between 10:00 - 10:30 AM)
// export const markAttendance = (req, res) => {
//   const userId = req.user?.userId;
//   const status = "Present";

//   if (!userId) {
//     return res.status(400).json({ message: "User not authenticated" });
//   }

//   const now = new Date();
//   const currentTime = now.getHours() * 60 + now.getMinutes();
//   const today = now.toISOString().split("T")[0];

//   if (currentTime < 600 || currentTime > 630) {
//     return res.status(403).json({
//       message: "⛔ Attendance allowed only between 10:00 and 10:30 AM",
//     });
//   }

//   const query = `
//     INSERT INTO attendance (user_id, date, status)
//     VALUES (?, ?, ?)
//     ON DUPLICATE KEY UPDATE status = ?
//   `;

//   connection.query(query, [userId, today, status, status], (err) => {
//     if (err)
//       return res.status(500).json({ message: "❌ DB Error", error: err });
//     res.status(200).json({ message: "✅ Attendance marked successfully" });
//   });
// };

// // ✅ Admin updates attendance
// export const updateAttendance = (req, res) => {
//   const { userId, date, status } = req.body;

//   if (!userId || !date || !status) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const query = `
//     INSERT INTO attendance (user_id, date, status)
//     VALUES (?, ?, ?)
//     ON DUPLICATE KEY UPDATE status = ?
//   `;

//   connection.query(query, [userId, date, status, status], (err) => {
//     if (err) {
//       console.error("❌ MySQL Error:", err);
//       return res.status(500).json({ error: "DB Error", details: err });
//     }

//     // ✅ Immediately return updated row
//     const fetchQuery = `SELECT * FROM attendance WHERE user_id = ? AND date = ?`;
//     connection.query(fetchQuery, [userId, date], (err2, results) => {
//       if (err2) return res.status(500).json({ error: "DB Fetch Error" });
//       res.status(200).json({ message: "Attendance updated", updated: results });
//     });
//   });
// };

// // ✅ Admin views all attendance (optionally filter by date)
// export const getAttendanceByDate = (req, res) => {
//   const { date } = req.query;

//   const query = date
//     ? `SELECT * FROM attendance WHERE date = ?`
//     : `SELECT * FROM attendance ORDER BY date DESC`;

//   connection.query(query, date ? [date] : [], (err, results) => {
//     if (err) return res.status(500).json({ error: "DB Error" });
//     res.status(200).json(results);
//   });
// };

// // ✅ Staff views their own attendance
// export const getMyAttendance = (req, res) => {
//   const userId = req.user?.userId;
//   const query = `
//     SELECT * FROM attendance
//     WHERE user_id = ?
//     ORDER BY date DESC
//   `;

//   connection.query(query, [userId], (err, results) => {
//     if (err) return res.status(500).json({ error: "DB Error" });
//     res.status(200).json(results);
//   });
// };

// // ✅ Admin views attendance of a specific user (all or filtered by month/year)
// export const getAttendanceByUser = (req, res) => {
//   const userId = req.params.id;
//   const { month, year } = req.query;

//   if (!userId) {
//     return res.status(400).json({ error: "Missing user ID" });
//   }

//   let query;
//   let params;

//   if (month && year) {
//     const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
//     const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

//     query = `
//       SELECT * FROM attendance
//       WHERE user_id = ? AND date BETWEEN ? AND ?
//       ORDER BY date ASC
//     `;
//     params = [userId, startDate, endDate];
//   } else {
//     query = `
//       SELECT * FROM attendance
//       WHERE user_id = ?
//       ORDER BY date DESC
//     `;
//     params = [userId];
//   }

//   connection.query(query, params, (err, results) => {
//     if (err) return res.status(500).json({ error: "DB Error", err });
//     res.status(200).json(results);
//   });
// };

