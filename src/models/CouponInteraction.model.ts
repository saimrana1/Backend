import mongoose, { Schema } from 'mongoose';

const couponInteractionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true, index: true },
    action: { type: String, enum: ['like', 'use'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

/** One user can only perform each action on a coupon once. */
couponInteractionSchema.index({ user: 1, coupon: 1, action: 1 }, { unique: true });

export const CouponInteraction =
  mongoose.models.CouponInteraction || mongoose.model('CouponInteraction', couponInteractionSchema);
