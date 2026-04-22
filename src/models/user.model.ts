import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, required: true },
    networkId: { type: Schema.Types.ObjectId, ref: 'Network', default: null },
    permissionIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
