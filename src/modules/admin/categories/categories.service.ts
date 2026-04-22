import mongoose from 'mongoose';
import { Category, Store } from '../../../models';
import { HttpError } from '../../../common/utils/httpError';

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function toCategoryResponse(c: {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string | null;
  featureEnabled: boolean;
  slider: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description,
    featureEnabled: c.featureEnabled,
    slider: c.slider,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function listCategories() {
  const rows = await Category.find().sort({ createdAt: 1 }).lean();
  return rows.map((c) => toCategoryResponse(c as unknown as Parameters<typeof toCategoryResponse>[0]));
}

export async function createCategory(input: {
  name: string;
  slug?: string | null;
  description?: string | null;
  featureEnabled?: boolean;
  slider?: boolean;
}) {
  const slug = (input.slug && input.slug.length > 0 ? input.slug : slugify(input.name)) || slugify(`cat-${Date.now()}`);

  try {
    const c = await Category.create({
      name: input.name,
      slug,
      description: input.description ?? null,
      featureEnabled: input.featureEnabled ?? false,
      slider: input.slider ?? false,
    });
    return toCategoryResponse(c.toObject() as unknown as Parameters<typeof toCategoryResponse>[0]);
  } catch (e: unknown) {
    if (isDuplicateKey(e)) throw HttpError.conflict('Slug already exists');
    throw e;
  }
}

export async function getCategory(id: string) {
  const c = await Category.findById(id).lean();
  if (!c) throw HttpError.notFound('Category');
  return toCategoryResponse(c as unknown as Parameters<typeof toCategoryResponse>[0]);
}

export async function updateCategory(
  id: string,
  input: {
    name?: string;
    slug?: string;
    description?: string | null;
    featureEnabled?: boolean;
    slider?: boolean;
  },
) {
  const $set: Record<string, unknown> = {};
  if (input.name !== undefined) $set.name = input.name;
  if (input.slug !== undefined) $set.slug = input.slug;
  if (input.description !== undefined) $set.description = input.description;
  if (input.featureEnabled !== undefined) $set.featureEnabled = input.featureEnabled;
  if (input.slider !== undefined) $set.slider = input.slider;

  try {
    const c = await Category.findByIdAndUpdate(id, { $set }, { new: true }).lean();
    if (!c) throw HttpError.notFound('Category');
    return toCategoryResponse(c as unknown as Parameters<typeof toCategoryResponse>[0]);
  } catch (e: unknown) {
    if (isDuplicateKey(e)) throw HttpError.conflict('Slug already exists');
    throw e;
  }
}

export async function setCategoryFeatureEnabled(id: string, featureEnabled: boolean) {
  const c = await Category.findByIdAndUpdate(id, { $set: { featureEnabled } }, { new: true }).lean();
  if (!c) throw HttpError.notFound('Category');
  return toCategoryResponse(c as unknown as Parameters<typeof toCategoryResponse>[0]);
}

export async function setCategorySlider(id: string, slider: boolean) {
  const c = await Category.findByIdAndUpdate(id, { $set: { slider } }, { new: true }).lean();
  if (!c) throw HttpError.notFound('Category');
  return toCategoryResponse(c as unknown as Parameters<typeof toCategoryResponse>[0]);
}

export async function deleteCategory(id: string) {
  const oid = new mongoose.Types.ObjectId(id);
  await Store.updateMany({ categories: oid }, { $pull: { categories: oid } });
  const r = await Category.findByIdAndDelete(id);
  if (!r) throw HttpError.notFound('Category');
}

function isDuplicateKey(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'code' in e && (e as { code?: number }).code === 11000;
}
