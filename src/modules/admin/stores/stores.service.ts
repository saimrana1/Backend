import mongoose from 'mongoose';
import { Category, Coupon, Store } from '../../../models';
import { StoreStatus } from '../../../common/constants/enums';
import { HttpError } from '../../../common/utils/httpError';

const STATUS_VALUES = new Set<string>(Object.values(StoreStatus));

function assertStoreStatus(status: string): asserts status is StoreStatus {
  if (!STATUS_VALUES.has(status)) {
    throw HttpError.badRequest(`Invalid status. Allowed: ${[...STATUS_VALUES].join(', ')}`);
  }
}

type PopulatedCategory = { _id: mongoose.Types.ObjectId; name: string; slug: string };

function toStoreListResponse(doc: {
  _id: mongoose.Types.ObjectId;
  name: string;
  heading: string;
  status: string;
  featured: boolean;
  categories?: unknown;
}) {
  const cats = (doc.categories ?? []) as { name?: string }[];
  return {
    id: doc._id.toString(),
    name: doc.name,
    heading: doc.heading,
    status: doc.status,
    featured: doc.featured,
    categories: cats.map((c) => c.name ?? ''),
  };
}

function toStoreDetailResponse(doc: {
  _id: mongoose.Types.ObjectId;
  name: string;
  heading: string;
  status: string;
  featured: boolean;
  affiliateUrl: string | null;
  descriptionShortHtml: string;
  descriptionLongHtml: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  categories?: unknown;
}) {
  const cats = (doc.categories ?? []) as PopulatedCategory[];
  return {
    id: doc._id.toString(),
    name: doc.name,
    heading: doc.heading,
    status: doc.status,
    featured: doc.featured,
    affiliateUrl: doc.affiliateUrl,
    descriptionShortHtml: doc.descriptionShortHtml,
    descriptionLongHtml: doc.descriptionLongHtml,
    logoUrl: doc.logoUrl,
    categoryIds: cats.map((c) => c._id.toString()),
    categories: cats.map((c) => ({ id: c._id.toString(), name: c.name, slug: c.slug })),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function assertCategoriesExist(categoryIds: string[]) {
  if (categoryIds.length === 0) return;
  const oids = categoryIds.map((id) => new mongoose.Types.ObjectId(id));
  const n = await Category.countDocuments({ _id: { $in: oids } });
  if (n !== categoryIds.length) {
    throw HttpError.badRequest('One or more categoryIds are invalid');
  }
}

export async function listStores() {
  const rows = await Store.find().sort({ createdAt: 1 }).populate('categories', 'name slug').lean();
  return rows.map((s) => toStoreListResponse(s as unknown as Parameters<typeof toStoreListResponse>[0]));
}

export async function createStore(input: {
  name: string;
  heading: string;
  status?: string;
  featured?: boolean;
  affiliateUrl?: string | null;
  descriptionShortHtml?: string;
  descriptionLongHtml?: string;
  categoryIds?: string[];
}) {
  const status = input.status ?? StoreStatus.DRAFT;
  assertStoreStatus(status);

  const categoryIds = input.categoryIds ?? [];
  await assertCategoriesExist(categoryIds);

  const categories = categoryIds.map((id) => new mongoose.Types.ObjectId(id));

  const store = await Store.create({
    name: input.name,
    heading: input.heading,
    status,
    featured: input.featured ?? false,
    affiliateUrl: input.affiliateUrl ?? null,
    descriptionShortHtml: input.descriptionShortHtml ?? '',
    descriptionLongHtml: input.descriptionLongHtml ?? '',
    categories,
  });

  const full = await Store.findById(store._id).populate('categories', 'name slug').lean();
  if (!full) throw HttpError.notFound('Store');
  return toStoreDetailResponse(full as unknown as Parameters<typeof toStoreDetailResponse>[0]);
}

export async function getStore(id: string) {
  const s = await Store.findById(id).populate('categories', 'name slug').lean();
  if (!s) throw HttpError.notFound('Store');
  return toStoreDetailResponse(s as unknown as Parameters<typeof toStoreDetailResponse>[0]);
}

export async function updateStore(
  id: string,
  input: {
    name?: string;
    heading?: string;
    status?: string;
    featured?: boolean;
    affiliateUrl?: string | null;
    descriptionShortHtml?: string;
    descriptionLongHtml?: string;
    logoUrl?: string | null;
    categoryIds?: string[];
  },
) {
  if (input.status !== undefined) assertStoreStatus(input.status);
  if (input.categoryIds) await assertCategoriesExist(input.categoryIds);

  const $set: Record<string, unknown> = {};
  if (input.name !== undefined) $set.name = input.name;
  if (input.heading !== undefined) $set.heading = input.heading;
  if (input.status !== undefined) $set.status = input.status;
  if (input.featured !== undefined) $set.featured = input.featured;
  if (input.affiliateUrl !== undefined) $set.affiliateUrl = input.affiliateUrl;
  if (input.descriptionShortHtml !== undefined) $set.descriptionShortHtml = input.descriptionShortHtml;
  if (input.descriptionLongHtml !== undefined) $set.descriptionLongHtml = input.descriptionLongHtml;
  if (input.logoUrl !== undefined) $set.logoUrl = input.logoUrl;
  if (input.categoryIds !== undefined) {
    $set.categories = input.categoryIds.map((cid) => new mongoose.Types.ObjectId(cid));
  }

  const s = await Store.findByIdAndUpdate(id, { $set }, { new: true }).populate('categories', 'name slug').lean();
  if (!s) throw HttpError.notFound('Store');
  return toStoreDetailResponse(s as unknown as Parameters<typeof toStoreDetailResponse>[0]);
}

export async function setStoreFeatured(id: string, featured: boolean) {
  await Store.findByIdAndUpdate(id, { $set: { featured } });
  const full = await Store.findById(id).populate('categories', 'name slug').lean();
  if (!full) throw HttpError.notFound('Store');
  return toStoreDetailResponse(full as unknown as Parameters<typeof toStoreDetailResponse>[0]);
}

export async function deleteStore(id: string) {
  const oid = new mongoose.Types.ObjectId(id);
  await Coupon.deleteMany({ storeId: oid });
  const r = await Store.findByIdAndDelete(id);
  if (!r) throw HttpError.notFound('Store');
}
