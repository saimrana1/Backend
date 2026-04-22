import mongoose, { Schema } from 'mongoose';

const couponSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    title: { type: String, required: true, trim: true },
    offerDetails: { type: String, required: true },
    couponCode: { type: String, default: null },
    destinationUrl: { type: String, default: null },
    descriptionHtml: { type: String, default: null },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

couponSchema.index({ storeId: 1, sortOrder: 1 });

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
