import mongoose, { Schema } from 'mongoose';

const cashbackTransactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
    store: { type: Schema.Types.ObjectId, ref: 'Store', default: null },
    cashbackAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'withdrawn'],
      required: true,
      default: 'pending',
    },
    withdrawMethod: {
      type: String,
      enum: ['bank', 'wallet', 'voucher'],
      default: null,
    },
  },
  { timestamps: true },
);

cashbackTransactionSchema.index({ user: 1, status: 1 });

export const CashbackTransaction =
  mongoose.models.CashbackTransaction ||
  mongoose.model('CashbackTransaction', cashbackTransactionSchema);
