import mongoose, { Schema } from 'mongoose';

const walletHistoryEntrySchema = new Schema(
  {
    amount: { type: Number, required: true },
    type: { type: String, enum: ['earned', 'withdrawn'], required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, default: null, sparse: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, required: true },
    networkId: { type: Schema.Types.ObjectId, ref: 'Network', default: null },
    permissionIds: { type: [String], default: [] },
    /** Cashback-platform fields */
    cashbackBalance: { type: Number, default: 0, min: 0 },
    walletHistory: { type: [walletHistoryEntrySchema], default: [] },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
