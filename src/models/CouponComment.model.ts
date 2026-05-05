import mongoose, { Schema } from 'mongoose';

const couponCommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true, index: true },
    text: { type: String, required: true, maxlength: 2000, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

couponCommentSchema.index({ coupon: 1, createdAt: -1 });

export const CouponComment =
  mongoose.models.CouponComment || mongoose.model('CouponComment', couponCommentSchema);
