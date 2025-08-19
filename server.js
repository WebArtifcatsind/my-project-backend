


//D:\office\webartifacts\web-backend\server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import Google Generative AI
import { GoogleGenerativeAI } from '@google/generative-ai';

// REMOVED: import connection from "./models/db.js";
// The connection is now handled dynamically within the controllers

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import trainingRoutes from "./routes/trainingRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();
const app = express();

// --- UPDATED: Enable CORS for production and development ---
const allowedOrigins = [
  "http://localhost:5173", // For local frontend development
  "https://my-project-backend.vercel.app", // Your Vercel domain
  "https://webartifacts.in", // Your custom domain
  "https://www.webartifacts.in", // Your custom domain with www
  "https://elaborate-panda-a27d29.netlify.app", // Your Netlify preview domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Enable JSON body parsing
app.use(express.json());

// ✅ Enable static access to uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve all uploads from /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Register all routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api', contactRoutes);

// --- Gemini Chatbot Integration ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

// In-memory store for conversation history per session
const conversations = {};

app.post('/api/gemini-chatbot', async (req, res) => {
  const { message, sessionId } = req.body;
  let history = conversations[sessionId] || [];

  try {
    const systemMessage = {
      role: 'user', 
      parts: [
        { text: `You are WebArtifacts, a helpful and professional IT services chatbot. Your purpose is to answer questions about our services, company, and contact information. Here is some information about us:
        - **Company Name:** WebArtifacts
        - **Services:** Managed IT Support, Cloud Deployment & Backup, Custom Software Development, Cybersecurity Consulting, Website & App Development, ERP & Document Management, Help Desk Support, Data Analytics & Dashboards.
        - **Contact:** Email us at webartifactsind@gmail.com or call +91 7758969022.
        - **Working Hours:** Monday to Saturday , 10 AM to 6 PM IST.
        - **Address:** Plot no.20, Bhoyar Layout, Balaji Nagar, Nagpur, Maharashtra 440027.
        - **Working Process:** Strategic Connect, Precision Management, Growth Planning, Flawless Execution.
        - **Mission:** We deliver secure, scalable, and smart IT solutions tailored to your business growth.
    
        Always respond in a concise and professional manner. If asked a question you don't know, suggest checking the website or contacting a human representative.
        ` }
      ]
    };

    const chat = model.startChat({
      history: [systemMessage, ...history], 
      generationConfig: {
        maxOutputTokens: 150, 
      },
    });

    const result = await chat.sendMessage(message);
    const botReply = await result.response.text();
    
    history.push({ role: 'user', parts: [{ text: message }] });
    history.push({ role: 'model', parts: [{ text: botReply }] });
    conversations[sessionId] = history;

    res.json({ reply: botReply });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ reply: "I'm sorry, I'm having trouble connecting to the AI right now. Please try again later or contact our team directly." });
  }
});

// Optional: Route to reset conversation history for a session
app.post('/api/gemini-chatbot/reset', (req, res) => {
  const { sessionId } = req.body;
  if (conversations[sessionId]) {
    delete conversations[sessionId];
    console.log(`Conversation for session ${sessionId} reset.`);
  }
  res.json({ status: 'success', message: 'Conversation reset.' });
});
// --- End Gemini Chatbot Integration ---


// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

// ✅ Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});






// //D:\office\webartifacts\web-backend\server.js

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";

// // Import Google Generative AI
// import { GoogleGenerativeAI } from '@google/generative-ai';

// import connection from "./models/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import salaryRoutes from "./routes/salaryRoutes.js";
// import trainingRoutes from "./routes/trainingRoutes.js";
// import clientRoutes from "./routes/clientRoutes.js";
// import documentRoutes from "./routes/documentRoutes.js";
// import leaveRoutes from "./routes/leaveRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import dashboardRoutes from "./routes/dashboardRoutes.js";
// import contactRoutes from './routes/contactRoutes.js';

// dotenv.config();
// const app = express();

// // --- UPDATED: Enable CORS for production and development ---
// const allowedOrigins = [
//   "http://localhost:5173", // For local frontend development
//   "https://my-project-backend.vercel.app", // Your Vercel domain
//   "https://webartifacts.in", // Your custom domain
//   "https://www.webartifacts.in", // Your custom domain with www
//   "https://elaborate-panda-a27d29.netlify.app", // Your Netlify preview domain
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = "The CORS policy for this site does not allow access from the specified Origin.";
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   credentials: true,
// }));

// // Enable JSON body parsing
// app.use(express.json());

// // ✅ Enable static access to uploaded files
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Serve all uploads from /uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // ✅ Register all routes
// app.use("/api/auth", authRoutes);
// app.use("/api", userRoutes);
// app.use("/api/salary", salaryRoutes);
// app.use("/api/training", trainingRoutes);
// app.use("/api/client", clientRoutes);
// app.use("/api/documents", documentRoutes);
// app.use("/api/leaves", leaveRoutes);
// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use('/api', contactRoutes);

// // --- Gemini Chatbot Integration ---
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

// // In-memory store for conversation history per session
// const conversations = {};

// app.post('/api/gemini-chatbot', async (req, res) => {
//   const { message, sessionId } = req.body;
//   let history = conversations[sessionId] || [];

//   try {
//     const systemMessage = {
//       role: 'user', 
//       parts: [
//         { text: `You are WebArtifacts, a helpful and professional IT services chatbot. Your purpose is to answer questions about our services, company, and contact information. Here is some information about us:
//         - **Company Name:** WebArtifacts
//         - **Services:** Managed IT Support, Cloud Deployment & Backup, Custom Software Development, Cybersecurity Consulting, Website & App Development, ERP & Document Management, Help Desk Support, Data Analytics & Dashboards.
//         - **Contact:** Email us at webartifactsind@gmail.com or call +91 7758969022.
//         - **Working Hours:** Monday to Saturday , 10 AM to 6 PM IST.
//         - **Address:** Plot no.20, Bhoyar Layout, Balaji Nagar, Nagpur, Maharashtra 440027.
//         - **Working Process:** Strategic Connect, Precision Management, Growth Planning, Flawless Execution.
//         - **Mission:** We deliver secure, scalable, and smart IT solutions tailored to your business growth.
    
//         Always respond in a concise and professional manner. If asked a question you don't know, suggest checking the website or contacting a human representative.
//         ` }
//       ]
//     };

//     const chat = model.startChat({
//       history: [systemMessage, ...history], 
//       generationConfig: {
//         maxOutputTokens: 150, 
//       },
//     });

//     const result = await chat.sendMessage(message);
//     const botReply = await result.response.text();
    
//     history.push({ role: 'user', parts: [{ text: message }] });
//     history.push({ role: 'model', parts: [{ text: botReply }] });
//     conversations[sessionId] = history;

//     res.json({ reply: botReply });

//   } catch (error) {
//     console.error('Error calling Gemini API:', error);
//     res.status(500).json({ reply: "I'm sorry, I'm having trouble connecting to the AI right now. Please try again later or contact our team directly." });
//   }
// });

// // Optional: Route to reset conversation history for a session
// app.post('/api/gemini-chatbot/reset', (req, res) => {
//   const { sessionId } = req.body;
//   if (conversations[sessionId]) {
//     delete conversations[sessionId];
//     console.log(`Conversation for session ${sessionId} reset.`);
//   }
//   res.json({ status: 'success', message: 'Conversation reset.' });
// });
// // --- End Gemini Chatbot Integration ---


// // ✅ Health check route
// app.get("/", (req, res) => {
//   res.send("✅ Server is running!");
// });

// // ✅ Start the server
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });




// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";

// // Import Google Generative AI
// import { GoogleGenerativeAI } from '@google/generative-ai';

// import connection from "./models/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import salaryRoutes from "./routes/salaryRoutes.js";
// import trainingRoutes from "./routes/trainingRoutes.js";
// import clientRoutes from "./routes/clientRoutes.js";
// import documentRoutes from "./routes/documentRoutes.js";
// import leaveRoutes from "./routes/leaveRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import dashboardRoutes from "./routes/dashboardRoutes.js";
// import contactRoutes from './routes/contactRoutes.js';

// dotenv.config();
// const app = express();

// // Enable CORS for frontend on Vite
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
// }));

// // Enable JSON body parsing
// app.use(express.json());

// // ✅ Enable static access to uploaded files
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Serve all uploads from /uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // ✅ Register all routes
// app.use("/api/auth", authRoutes);
// app.use("/api", userRoutes);
// app.use("/api/salary", salaryRoutes);
// app.use("/api/training", trainingRoutes);
// app.use("/api/client", clientRoutes);
// app.use("/api/documents", documentRoutes);
// app.use("/api/leaves", leaveRoutes);
// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use('/api', contactRoutes);

// // --- Gemini Chatbot Integration ---
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

// // In-memory store for conversation history per session
// const conversations = {};

// app.post('/api/gemini-chatbot', async (req, res) => {
//     const { message, sessionId } = req.body;
//     let history = conversations[sessionId] || [];

//     try {
//         // Initial system message to set the chatbot's persona and knowledge
//         const systemMessage = {
//             role: 'user', // Gemini expects system messages to be from 'user' for context setting
//             parts: [
//                 { text: `You are WebArtifacts, a helpful and professional IT services chatbot. Your purpose is to answer questions about our services, company, and contact information. Here is some information about us:
//                 - **Company Name:** WebArtifacts
//                 - **Services:** Managed IT Support, Cloud Deployment & Backup, Custom Software Development, Cybersecurity Consulting, Website & App Development, ERP & Document Management, Help Desk Support, Data Analytics & Dashboards.
//                 - **Contact:** Email us at webartifactsind@gmail.com or call +91 7758969022.
//                 - **Working Hours:** Monday to Saturday , 10 AM to 6 PM IST.
//                 - **Address:** Plot no.20, Bhoyar Layout, Balaji Nagar, Nagpur, Maharashtra 440027.
//                 - **Working Process:** Strategic Connect, Precision Management, Growth Planning, Flawless Execution.
//                 - **Mission:** We deliver secure, scalable, and smart IT solutions tailored to your business growth.
    
//                 Always respond in a concise and professional manner. If asked a question you don't know, suggest checking the website or contacting a human representative.
//                 ` }
//             ]
//         };

//         const chat = model.startChat({
//             history: [systemMessage, ...history], // Include system message and previous history
//             generationConfig: {
//                 maxOutputTokens: 150, // Limit response length
//             },
//         });

//         const result = await chat.sendMessage(message);
//         const botReply = await result.response.text();
        
//         // Update conversation history for the session
//         history.push({ role: 'user', parts: [{ text: message }] });
//         history.push({ role: 'model', parts: [{ text: botReply }] });
//         conversations[sessionId] = history;

//         res.json({ reply: botReply });

//     } catch (error) {
//         console.error('Error calling Gemini API:', error);
//         // Provide a user-friendly error message
//         res.status(500).json({ reply: "I'm sorry, I'm having trouble connecting to the AI right now. Please try again later or contact our team directly." });
//     }
// });

// // Optional: Route to reset conversation history for a session
// app.post('/api/gemini-chatbot/reset', (req, res) => {
//     const { sessionId } = req.body;
//     if (conversations[sessionId]) {
//         delete conversations[sessionId];
//         console.log(`Conversation for session ${sessionId} reset.`);
//     }
//     res.json({ status: 'success', message: 'Conversation reset.' });
// });
// // --- End Gemini Chatbot Integration ---


// // ✅ Health check route
// app.get("/", (req, res) => {
//     res.send("✅ Server is running!");
// });

// // ✅ Start the server
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
// });







// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";

// import connection from "./models/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import salaryRoutes from "./routes/salaryRoutes.js";
// import trainingRoutes from "./routes/trainingRoutes.js";
// import clientRoutes from "./routes/clientRoutes.js";
// import documentRoutes from "./routes/documentRoutes.js";
// import leaveRoutes from "./routes/leaveRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import dashboardRoutes from "./routes/dashboardRoutes.js";
// import contactRoutes from './routes/contactRoutes.js';

// dotenv.config();
// const app = express();

// // Enable CORS for frontend on Vite
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
// }));

// // Enable JSON body parsing
// app.use(express.json());

// // ✅ Enable static access to uploaded files
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Serve all uploads from /uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // ✅ Register all routes
// app.use("/api/auth", authRoutes);
// app.use("/api", userRoutes);
// app.use("/api/salary", salaryRoutes);
// app.use("/api/training", trainingRoutes);
// app.use("/api/client", clientRoutes);
// app.use("/api/documents", documentRoutes);
// app.use("/api/leaves", leaveRoutes);
// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use('/api', contactRoutes);

// // ✅ Health check route
// app.get("/", (req, res) => {
//   res.send("✅ Server is running!");
// });

// // ✅ Start the server
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

















// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connection from "./models/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import salaryRoutes from "./routes/salaryRoutes.js";
// import trainingRoutes from "./routes/trainingRoutes.js";
// import clientRoutes from "./routes/clientRoutes.js";
// import documentRoutes from "./routes/documentRoutes.js";
// import leaveRoutes from "./routes/leaveRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import dashboardRoutes from "./routes/dashboardRoutes.js";

// dotenv.config();
// const app = express();



// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
// }));

// app.use(express.json());



// // ✅ Register routes
// app.use("/api/auth", authRoutes);
// app.use("/api", userRoutes);
// app.use("/api/salary", salaryRoutes);
// app.use("/api/training", trainingRoutes);
// app.use("/api/client", clientRoutes);
// app.use("/api/documents", documentRoutes);
// app.use("/api/leaves", leaveRoutes);
// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// // ✅ Root route
// app.get("/", (req, res) => {
//   res.send("✅ Server is running!");
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });








