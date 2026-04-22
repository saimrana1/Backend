import mongoose, { Schema } from 'mongoose';

const dealSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    shortDescriptionHtml: { type: String, default: '' },
    longDescriptionHtml: { type: String, default: '' },
    metaTitle: { type: String, default: null },
    metaDescription: { type: String, default: null },
  },
  { timestamps: true },
);

export const Deal = mongoose.models.Deal || mongoose.model('Deal', dealSchema);
