

// //D:\office\webartifacts\web-backend\models\db.js



//D:\office\webartifacts\web-backend\models\db.js

import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const getConnection = async () => {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    return connection;
  } catch (err) {
    console.error("❌ MySQL Connection Failed:", err);
    throw err;
  }
};

export default getConnection;





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
