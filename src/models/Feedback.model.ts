import mongoose, { Schema } from 'mongoose';

const feedbackSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, default: '', trim: true, maxlength: 120 },
    quote: { type: String, required: true, trim: true, maxlength: 2000 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    featured: { type: Boolean, default: false },
    avatar: {
      skin: { type: String, default: '#f5d6b8' },
      hair: { type: String, default: '#3a2313' },
      shirt: { type: String, default: '#4a90d9' },
      accent: { type: String, default: '#e74c3c' },
      pattern: { type: String, enum: ['dots', 'ring', 'stripes'], default: 'dots' },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

feedbackSchema.index({ featured: -1, createdAt: -1 });

export const Feedback =
  mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
