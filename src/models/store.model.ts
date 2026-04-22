import mongoose, { Schema } from 'mongoose';

const storeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    heading: { type: String, required: true, trim: true },
    status: { type: String, required: true },
    featured: { type: Boolean, default: false },
    affiliateUrl: { type: String, default: null },
    descriptionShortHtml: { type: String, default: '' },
    descriptionLongHtml: { type: String, default: '' },
    logoUrl: { type: String, default: null },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  },
  { timestamps: true },
);

export const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);
