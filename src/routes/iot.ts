import { Router, Request, Response } from "express";
import { WasteDetection } from "../models/WasteDetection.js";

const router = Router();

/**
 * POST /api/iot/zerofest
 *
 * Accepts raw IoT device message in the format:
 * {
 *   "s_id": [948, 1503],
 *   "d_id": "98cd.ac46.2590",
 *   "w": 3692,
 *   "dw": 34,
 *   "ts": 1780905434,
 *   "classification": "plastic",
 *   "decision_confidence": 0.81,
 *   "local_confidence": 0.63,
 *   "confidence_threshold": 0.75,
 *   "network_congested": false,
 *   "local_decision": false,
 *   "cloud_inference": true
 * }
 *
 * Maps raw device fields to internal model:
 *   w          -> weight
 *   dw         -> weightDelta
 *   d_id       -> deviceId
 *   s_id       -> sensorIds
 *   ts         -> deviceTimestamp
 */
router.post("/zerofest", async (req: Request, res: Response) => {
  try {
    const {
      s_id,
      d_id,
      w,
      dw,
      ts,
      classification,
      decision_confidence,
      local_confidence,
      confidence_threshold,
      network_congested,
      local_decision,
      cloud_inference,
    } = req.body;

    // Basic validation — classification and weight are required
    if (!classification || typeof classification !== "string") {
      res.status(400).json({ success: false, error: "classification is required and must be a string" });
      return;
    }

    if (w === undefined || typeof w !== "number" || w < 0) {
      res.status(400).json({ success: false, error: "w (weight) is required and must be a non-negative number" });
      return;
    }

    const detection = await WasteDetection.create({
      classification: classification.trim().toLowerCase(),
      weight: w,
      weightDelta: typeof dw === "number" ? dw : undefined,
      deviceId: d_id || undefined,
      sensorIds: Array.isArray(s_id) ? s_id : undefined,
      deviceTimestamp: typeof ts === "number" ? ts : undefined,
      decisionConfidence: typeof decision_confidence === "number" ? decision_confidence : undefined,
      localConfidence: typeof local_confidence === "number" ? local_confidence : undefined,
      confidenceThreshold: typeof confidence_threshold === "number" ? confidence_threshold : undefined,
      networkCongested: typeof network_congested === "boolean" ? network_congested : undefined,
      localDecision: typeof local_decision === "boolean" ? local_decision : undefined,
      cloudInference: typeof cloud_inference === "boolean" ? cloud_inference : undefined,
    });

    console.log(
      `[IoT] Saved detection: ${detection.classification} ${detection.weight}g ` +
        `| device=${detection.deviceId || "unknown"} ` +
        `| confidence=${detection.decisionConfidence ?? "n/a"}`
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("[IoT] Error saving detection:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
