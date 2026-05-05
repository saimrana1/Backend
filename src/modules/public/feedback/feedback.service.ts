import mongoose from 'mongoose';
import { Feedback } from '../../../models';

/* ───────── list ───────── */

export async function listFeedback(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    Feedback.find()
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Feedback.countDocuments(),
  ]);

  const data = rows.map((r: any) => ({
    id: r._id.toString(),
    name: r.name,
    role: r.role ?? '',
    quote: r.quote,
    rating: r.rating,
    featured: r.featured ?? false,
    avatar: r.avatar ?? null,
    createdAt: r.createdAt?.toISOString() ?? null,
  }));

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/* ───────── submit ───────── */

export async function submitFeedback(
  userId: string | null,
  input: {
    name: string;
    role?: string;
    quote: string;
    rating: number;
    avatar?: {
      skin?: string;
      hair?: string;
      shirt?: string;
      accent?: string;
      pattern?: 'dots' | 'ring' | 'stripes';
    };
  },
) {
  const doc = await Feedback.create({
    user: userId ? new mongoose.Types.ObjectId(userId) : null,
    name: input.name,
    role: input.role ?? '',
    quote: input.quote,
    rating: input.rating,
    featured: false,
    avatar: input.avatar ?? undefined,
  });

  const r = doc.toObject();
  return {
    id: r._id.toString(),
    name: r.name,
    role: r.role ?? '',
    quote: r.quote,
    rating: r.rating,
    featured: r.featured,
    avatar: r.avatar ?? null,
    createdAt: r.createdAt?.toISOString() ?? null,
  };
}

/* ───────── admin: toggle featured ───────── */

export async function setFeatured(feedbackId: string, featured: boolean) {
  const updated = await Feedback.findByIdAndUpdate(
    feedbackId,
    { $set: { featured } },
    { new: true },
  ).lean();
  if (!updated) {
    const { HttpError } = await import('../../../common/utils/httpError');
    throw HttpError.notFound('Feedback');
  }
  const r = updated as any;
  return {
    id: r._id.toString(),
    name: r.name,
    featured: r.featured,
  };
}
