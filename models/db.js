

// //D:\office\webartifacts\web-backend\models\db.js



//D:\office\webartifacts\web-backend\models\db.js

import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

// --- CORRECTION: Use DATABASE_URL environment variable ---
const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
  } else {
    console.log("✅ Connected to MySQL Database!");
  }
});

export default connection;












// import mysql from "mysql2";
// import dotenv from "dotenv";
// dotenv.config();

// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// connection.connect((err) => {
//   if (err) {
//     console.error("❌ MySQL Connection Failed:", err);
//   } else {
//     console.log("✅ Connected to MySQL Database!");
//   }
// });

// export default connection;
