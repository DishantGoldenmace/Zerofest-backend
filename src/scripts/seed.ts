import "dotenv/config";
import mongoose from "mongoose";
import { WasteDetection } from "../models/WasteDetection.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/zerofest";

const demoDetections = [
  {
    classification: "plastic",
    weight: 34,
    weightDelta: 2,
    deviceId: "98cd.ac46.2590",
    sensorIds: [948, 1503],
    deviceTimestamp: Math.floor(Date.now() / 1000) - 120,
    decisionConfidence: 0.81,
    localConfidence: 0.63,
    confidenceThreshold: 0.75,
    networkCongested: false,
    localDecision: false,
    cloudInference: true,
  },
  {
    classification: "paper",
    weight: 50,
    weightDelta: 5,
    deviceId: "98cd.ac46.2590",
    sensorIds: [948, 1503],
    deviceTimestamp: Math.floor(Date.now() / 1000) - 60,
    decisionConfidence: 0.92,
    localConfidence: 0.88,
    confidenceThreshold: 0.75,
    networkCongested: false,
    localDecision: true,
    cloudInference: false,
  },
  {
    classification: "aluminum",
    weight: 18,
    weightDelta: 1,
    deviceId: "98cd.ac46.2590",
    sensorIds: [948, 1503],
    deviceTimestamp: Math.floor(Date.now() / 1000),
    decisionConfidence: 0.76,
    localConfidence: 0.55,
    confidenceThreshold: 0.75,
    networkCongested: true,
    localDecision: false,
    cloudInference: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[Seed] Connected to MongoDB");

    // Clear existing demo data
    const deleted = await WasteDetection.deleteMany({});
    console.log(`[Seed] Cleared ${deleted.deletedCount} existing records`);

    // Insert demo detections with staggered timestamps
    for (let i = 0; i < demoDetections.length; i++) {
      const detection = await WasteDetection.create(demoDetections[i]);
      console.log(`[Seed] Created: ${detection.classification} ${detection.weight}g`);

      // Small delay so createdAt timestamps differ
      if (i < demoDetections.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    console.log(`\n[Seed] ✓ Inserted ${demoDetections.length} demo detections`);
    console.log("[Seed] Done!");
  } catch (error) {
    console.error("[Seed] Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
