import mongoose, { Schema, Document } from "mongoose";

export interface IWasteDetection extends Document {
  classification: string;
  weight: number;
  weightDelta?: number;
  deviceId?: string;
  sensorIds?: number[];
  deviceTimestamp?: number;
  decisionConfidence?: number;
  localConfidence?: number;
  confidenceThreshold?: number;
  networkCongested?: boolean;
  localDecision?: boolean;
  cloudInference?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wasteDetectionSchema = new Schema<IWasteDetection>(
  {
    classification: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    weightDelta: {
      type: Number,
    },
    deviceId: {
      type: String,
      trim: true,
      default: undefined,
    },
    sensorIds: {
      type: [Number],
      default: undefined,
    },
    deviceTimestamp: {
      type: Number,
    },
    decisionConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    localConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    confidenceThreshold: {
      type: Number,
      min: 0,
      max: 1,
    },
    networkCongested: {
      type: Boolean,
    },
    localDecision: {
      type: Boolean,
    },
    cloudInference: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries on recent detections
wasteDetectionSchema.index({ createdAt: -1 });

export const WasteDetection = mongoose.model<IWasteDetection>(
  "WasteDetection",
  wasteDetectionSchema
);
