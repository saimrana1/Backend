import mongoose from 'mongoose';
import { Deal } from '../../../models';
import { HttpError } from '../../../common/utils/httpError';

function toDealResponse(d: {
  _id: mongoose.Types.ObjectId;
  title: string;
  shortDescriptionHtml: string;
  longDescriptionHtml: string;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: d._id.toString(),
    title: d.title,
    shortDescriptionHtml: d.shortDescriptionHtml,
    longDescriptionHtml: d.longDescriptionHtml,
    metaTitle: d.metaTitle,
    metaDescription: d.metaDescription,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

export async function listDeals() {
  const rows = await Deal.find().sort({ createdAt: -1 }).lean();
  return rows.map((d) => toDealResponse(d as unknown as Parameters<typeof toDealResponse>[0]));
}

export async function createDeal(input: {
  title: string;
  shortDescriptionHtml?: string;
  longDescriptionHtml?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
}) {
  const d = await Deal.create({
    title: input.title,
    shortDescriptionHtml: input.shortDescriptionHtml ?? '',
    longDescriptionHtml: input.longDescriptionHtml ?? '',
    metaTitle: input.metaTitle ?? null,
    metaDescription: input.metaDescription ?? null,
  });
  return toDealResponse(d.toObject() as unknown as Parameters<typeof toDealResponse>[0]);
}

export async function getDeal(id: string) {
  const d = await Deal.findById(id).lean();
  if (!d) throw HttpError.notFound('Deal');
  return toDealResponse(d as unknown as Parameters<typeof toDealResponse>[0]);
}

export async function updateDeal(
  id: string,
  input: {
    title?: string;
    shortDescriptionHtml?: string;
    longDescriptionHtml?: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
  },
) {
  const $set: Record<string, unknown> = { ...input };
  const d = await Deal.findByIdAndUpdate(id, { $set }, { new: true }).lean();
  if (!d) throw HttpError.notFound('Deal');
  return toDealResponse(d as unknown as Parameters<typeof toDealResponse>[0]);
}

export async function deleteDeal(id: string) {
  const r = await Deal.findByIdAndDelete(id);
  if (!r) throw HttpError.notFound('Deal');
}
