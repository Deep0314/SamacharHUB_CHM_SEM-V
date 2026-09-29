import { Router } from "express";
import mongoose from "mongoose";
import { connectMongoDB } from "../lib/mongodb.js";

const router = Router();

router.get("/healthz", async (_req, res) => {
  let error = null;
  try {
    await connectMongoDB();
  } catch (e: any) {
    error = e?.message || "Unknown connection error";
  }

  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  
  res.json({ 
    status: "ok",
    database: dbStatus,
    error: error,
    timestamp: new Date().toISOString()
  });
});

export default router;
