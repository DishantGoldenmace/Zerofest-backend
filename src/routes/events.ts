import { Router, Request, Response } from "express";
import { WasteDetection } from "../models/WasteDetection.js";

const router = Router();

/**
 * GET /api/events/zerofest
 *
 * Returns latest detection + recent detections + distribution stats.
 */
router.get("/zerofest", async (_req: Request, res: Response) => {
  try {
    const detections = await WasteDetection.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const latestDetection = detections[0] || null;
    const totalCount = await WasteDetection.countDocuments();

    // Compute distribution: count per classification
    const distributionRaw = await WasteDetection.aggregate([
      { $group: { _id: "$classification", count: { $sum: 1 }, totalWeight: { $sum: "$weight" } } },
      { $sort: { count: -1 } },
    ]);

    const distribution = distributionRaw.map((d) => ({
      classification: d._id as string,
      count: d.count as number,
      totalWeight: d.totalWeight as number,
      percentage: totalCount > 0 ? Math.round((d.count / totalCount) * 100) : 0,
    }));

    // Total weight in grams
    const totalWeightResult = await WasteDetection.aggregate([
      { $group: { _id: null, total: { $sum: "$weight" } } },
    ]);
    const totalWeight = totalWeightResult[0]?.total || 0;

    res.json({
      latestDetection,
      detections,
      totalCount,
      totalWeight,
      distribution,
    });
  } catch (error) {
    console.error("[Events] Error fetching detections:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
