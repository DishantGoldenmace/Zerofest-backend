import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import iotRoutes from "./routes/iot.js";
import eventsRoutes from "./routes/events.js";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/zerofest";

// CORS — allow Vercel frontend + localhost for dev
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/iot", iotRoutes);
app.use("/api/events", eventsRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[DB] Connected to MongoDB at ${MONGO_URI}`);

    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Server] IoT endpoint: POST http://localhost:${PORT}/api/iot/zerofest`);
      console.log(`[Server] Events API:   GET  http://localhost:${PORT}/api/events/zerofest`);
    });
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
}

start();
