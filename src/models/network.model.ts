import mongoose, { Schema } from 'mongoose';

const networkSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    trackingUrl: { type: String, default: null },
    status: { type: String, required: true },
  },
  { timestamps: true },
);

export const Network = mongoose.models.Network || mongoose.model('Network', networkSchema);
