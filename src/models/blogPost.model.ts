import mongoose, { Schema } from 'mongoose';

const blogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
