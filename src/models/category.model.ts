import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: null },
    featureEnabled: { type: Boolean, default: false },
    slider: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
