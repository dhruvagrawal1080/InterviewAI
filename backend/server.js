import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import resumeRoute from "./routes/resume.route.js";
import interviewRoute from "./routes/interview.route.js";
import SummaryRoute from "./routes/summary.route.js";

dotenv.config({quiet: true});

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api", resumeRoute);
app.use("/api", interviewRoute);
app.use("/api", SummaryRoute);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Your server is up and running....'
  });
});

app.get("/ping", (req, res) => {
  res.json({
    success: true,
    message: 'Server is alive 👋'
  });
});

// Handle Undefined Routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
