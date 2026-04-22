import mongoose from 'mongoose';
import { Coupon, Store } from '../../../models';
import { HttpError } from '../../../common/utils/httpError';

type LeanStoreId = mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name?: string };

function mapCoupon(c: {
  _id: mongoose.Types.ObjectId;
  storeId: LeanStoreId;
  title: string;
  offerDetails: string;
  couponCode: string | null;
  destinationUrl: string | null;
  descriptionHtml: string | null;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  const raw = c.storeId;
  const storeIdStr =
    raw && typeof raw === 'object' && '_id' in raw
      ? (raw as { _id: mongoose.Types.ObjectId })._id.toString()
      : (raw as mongoose.Types.ObjectId).toString();
  const storeName =
    raw && typeof raw === 'object' && 'name' in raw ? String((raw as { name?: unknown }).name ?? '') : '';

  return {
    id: c._id.toString(),
    storeId: storeIdStr,
    storeName,
    title: c.title,
    offerDetails: c.offerDetails,
    couponCode: c.couponCode,
    destinationUrl: c.destinationUrl,
    descriptionHtml: c.descriptionHtml,
    active: c.active,
    featured: c.featured,
    sortOrder: c.sortOrder,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function listCoupons(filters?: { storeId?: string }) {
  const filter: Record<string, unknown> = {};
  if (filters?.storeId) {
    filter.storeId = new mongoose.Types.ObjectId(filters.storeId);
  }
  const rows = await Coupon.find(filter)
    .sort({ storeId: 1, sortOrder: 1, _id: 1 })
    .populate('storeId', 'name')
    .lean();

  return rows.map((row) => mapCoupon(row as unknown as Parameters<typeof mapCoupon>[0]));
}

export async function createCoupon(input: {
  storeId: string;
  title: string;
  offerDetails: string;
  couponCode?: string | null;
  destinationUrl?: string | null;
  descriptionHtml?: string | null;
  active?: boolean;
  featured?: boolean;
}) {
  await assertStoreExists(input.storeId);

  const sortOrder = await nextSortOrder(input.storeId);

  const c = await Coupon.create({
    storeId: new mongoose.Types.ObjectId(input.storeId),
    title: input.title,
    offerDetails: input.offerDetails,
    couponCode: input.couponCode ?? null,
    destinationUrl: input.destinationUrl ?? null,
    descriptionHtml: input.descriptionHtml ?? null,
    active: input.active ?? true,
    featured: input.featured ?? false,
    sortOrder,
  });

  const full = await Coupon.findById(c._id).populate('storeId', 'name').lean();
  if (!full) throw HttpError.notFound('Coupon');
  return mapCoupon(full as unknown as Parameters<typeof mapCoupon>[0]);
}

export async function getCoupon(id: string) {
  const c = await Coupon.findById(id).populate('storeId', 'name').lean();
  if (!c) throw HttpError.notFound('Coupon');
  return mapCoupon(c as unknown as Parameters<typeof mapCoupon>[0]);
}

export async function updateCoupon(
  id: string,
  input: {
    storeId?: string;
    title?: string;
    offerDetails?: string;
    couponCode?: string | null;
    destinationUrl?: string | null;
    descriptionHtml?: string | null;
    active?: boolean;
    featured?: boolean;
  },
) {
  if (input.storeId !== undefined) await assertStoreExists(input.storeId);

  const $set: Record<string, unknown> = {};
  if (input.storeId !== undefined) $set.storeId = new mongoose.Types.ObjectId(input.storeId);
  if (input.title !== undefined) $set.title = input.title;
  if (input.offerDetails !== undefined) $set.offerDetails = input.offerDetails;
  if (input.couponCode !== undefined) $set.couponCode = input.couponCode;
  if (input.destinationUrl !== undefined) $set.destinationUrl = input.destinationUrl;
  if (input.descriptionHtml !== undefined) $set.descriptionHtml = input.descriptionHtml;
  if (input.active !== undefined) $set.active = input.active;
  if (input.featured !== undefined) $set.featured = input.featured;

  const c = await Coupon.findByIdAndUpdate(id, { $set }, { new: true }).populate('storeId', 'name').lean();
  if (!c) throw HttpError.notFound('Coupon');
  return mapCoupon(c as unknown as Parameters<typeof mapCoupon>[0]);
}

export async function deleteCoupon(id: string) {
  const r = await Coupon.findByIdAndDelete(id);
  if (!r) throw HttpError.notFound('Coupon');
}

export async function listCouponsForStoreOrdered(storeId: string) {
  await assertStoreExists(storeId);
  const oid = new mongoose.Types.ObjectId(storeId);
  const rows = await Coupon.find({ storeId: oid })
    .sort({ sortOrder: 1, _id: 1 })
    .select({ title: 1, offerDetails: 1, sortOrder: 1 })
    .lean();

  type Row = { _id: mongoose.Types.ObjectId; title: string; offerDetails: string; sortOrder: number };
  return rows.map((r) => {
    const row = r as unknown as Row;
    return {
      id: row._id.toString(),
      title: row.title,
      offerDetails: row.offerDetails,
      sortOrder: row.sortOrder,
    };
  });
}

export async function reorderCouponsForStore(storeId: string, orderedIds: string[]) {
  await assertStoreExists(storeId);
  const storeOid = new mongoose.Types.ObjectId(storeId);

  const existing = await Coupon.find({ storeId: storeOid }).select('_id').lean();
  const existingIds = new Set(
    existing.map((c) => (c as unknown as { _id: mongoose.Types.ObjectId })._id.toString()),
  );

  if (orderedIds.length !== existingIds.size) {
    throw HttpError.badRequest('orderedIds must include every coupon for the store exactly once');
  }

  for (const cid of orderedIds) {
    if (!existingIds.has(cid)) {
      throw HttpError.badRequest(`Coupon ${cid} does not belong to store ${storeId}`);
    }
  }

  await Coupon.bulkWrite(
    orderedIds.map((couponId, index) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(couponId), storeId: storeOid },
        update: { $set: { sortOrder: index } },
      },
    })),
  );

  return listCouponsForStoreOrdered(storeId);
}

async function nextSortOrder(storeId: string) {
  const oid = new mongoose.Types.ObjectId(storeId);
  const last = await Coupon.find({ storeId: oid }).sort({ sortOrder: -1 }).limit(1).select('sortOrder').lean();
  const max = last[0]?.sortOrder;
  return (typeof max === 'number' ? max : -1) + 1;
}

async function assertStoreExists(storeId: string) {
  const s = await Store.findById(storeId).select('_id').lean();
  if (!s) throw HttpError.badRequest('storeId does not exist');
}
