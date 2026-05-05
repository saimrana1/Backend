import mongoose, { Schema } from 'mongoose';

const newsletterSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  subscribedAt: { type: Date, default: Date.now },
});

export const Newsletter =
  mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);
