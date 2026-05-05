import mongoose from 'mongoose';
import { Store, Coupon, CouponInteraction } from '../../../models';
import { HttpError } from '../../../common/utils/httpError';

/* ───────── mappers ───────── */

type PopulatedCategory = { _id: mongoose.Types.ObjectId; name: string; slug: string };

function toPublicStoreCard(doc: any) {
  const cats = (doc.categories ?? []) as PopulatedCategory[];
  return {
    id: doc._id.toString(),
    name: doc.name,
    heading: doc.heading,
    logoUrl: doc.logoUrl ?? null,
    featured: doc.featured,
    descriptionShortHtml: doc.descriptionShortHtml ?? '',
    categories: cats.map((c) => ({ id: c._id.toString(), name: c.name, slug: c.slug })),
    couponsCount: doc._couponsCount ?? 0,
  };
}

function toPublicStoreDetail(doc: any) {
  const cats = (doc.categories ?? []) as PopulatedCategory[];
  return {
    id: doc._id.toString(),
    name: doc.name,
    heading: doc.heading,
    logoUrl: doc.logoUrl ?? null,
    featured: doc.featured,
    affiliateUrl: doc.affiliateUrl ?? null,
    descriptionShortHtml: doc.descriptionShortHtml ?? '',
    descriptionLongHtml: doc.descriptionLongHtml ?? '',
    categories: cats.map((c) => ({ id: c._id.toString(), name: c.name, slug: c.slug })),
    createdAt: doc.createdAt?.toISOString() ?? null,
  };
}

/* ───────── list ───────── */

export async function listPublicStores(filters: {
  category?: string;
  featured?: boolean;
  search?: string;
  page: number;
  limit: number;
}) {
  const query: Record<string, unknown> = { status: 'ACTIVE' };

  if (filters.featured !== undefined) {
    query.featured = filters.featured;
  }

  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }

  const skip = (filters.page - 1) * filters.limit;

  let storeQuery = Store.find(query)
    .sort({ featured: -1, createdAt: -1 })
    .skip(skip)
    .limit(filters.limit)
    .populate('categories', 'name slug')
    .lean();

  const [rows, total] = await Promise.all([
    storeQuery,
    Store.countDocuments(query),
  ]);

  // Filter by category name if provided (post-query since categories is a populated ref)
  let filtered = rows as any[];
  if (filters.category) {
    filtered = filtered.filter((s) => {
      const cats = (s.categories ?? []) as { name?: string; slug?: string }[];
      return cats.some(
        (cat) =>
          cat.name?.toLowerCase() === filters.category!.toLowerCase() ||
          cat.slug?.toLowerCase() === filters.category!.toLowerCase(),
      );
    });
  }

  // Batch-load coupon counts
  const storeIds = filtered.map((s: any) => s._id);
  const couponCounts = await Coupon.aggregate([
    { $match: { storeId: { $in: storeIds }, active: true } },
    { $group: { _id: '$storeId', count: { $sum: 1 } } },
  ]);
  const countsMap = new Map(couponCounts.map((r: any) => [r._id.toString(), r.count as number]));

  const data = filtered.map((s: any) => {
    s._couponsCount = countsMap.get(s._id.toString()) ?? 0;
    return toPublicStoreCard(s);
  });

  return {
    data,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: filters.category ? data.length : total,
      totalPages: Math.ceil((filters.category ? data.length : total) / filters.limit),
    },
  };
}

/* ───────── detail by slug or id ───────── */

export async function getStoreDetail(slugOrId: string, userId?: string) {
  let store: any;

  // Try by ID first, then by name (slug-like)
  if (mongoose.Types.ObjectId.isValid(slugOrId)) {
    store = await Store.findOne({ _id: slugOrId, status: 'ACTIVE' })
      .populate('categories', 'name slug')
      .lean();
  }
  if (!store) {
    store = await Store.findOne({ name: { $regex: `^${slugOrId}$`, $options: 'i' }, status: 'ACTIVE' })
      .populate('categories', 'name slug')
      .lean();
  }
  if (!store) throw HttpError.notFound('Store');

  // Fetch active coupons for this store
  const coupons = await Coupon.find({ storeId: store._id, active: true })
    .sort({ featured: -1, sortOrder: 1, _id: -1 })
    .lean();

  // Batch counts for coupons
  const couponIds = coupons.map((c: any) => c._id);
  const [likesCounts, usesCounts, userLikes] = await Promise.all([
    CouponInteraction.aggregate([
      { $match: { coupon: { $in: couponIds }, action: 'like' } },
      { $group: { _id: '$coupon', count: { $sum: 1 } } },
    ]),
    CouponInteraction.aggregate([
      { $match: { coupon: { $in: couponIds }, action: 'use' } },
      { $group: { _id: '$coupon', count: { $sum: 1 } } },
    ]),
    userId
      ? CouponInteraction.find({
          user: new mongoose.Types.ObjectId(userId),
          coupon: { $in: couponIds },
          action: 'like',
        })
          .select('coupon')
          .lean()
      : Promise.resolve([]),
  ]);

  const likesMap = new Map(likesCounts.map((r: any) => [r._id.toString(), r.count as number]));
  const usesMap = new Map(usesCounts.map((r: any) => [r._id.toString(), r.count as number]));
  const userLikedSet = new Set((userLikes as any[]).map((r) => r.coupon.toString()));

  const mappedCoupons = coupons.map((c: any) => {
    const id = c._id.toString();
    return {
      id,
      title: c.title,
      offerDetails: c.offerDetails,
      couponCode: c.couponCode,
      destinationUrl: c.destinationUrl,
      descriptionHtml: c.descriptionHtml,
      featured: c.featured,
      likesCount: likesMap.get(id) ?? 0,
      usesCount: usesMap.get(id) ?? 0,
      userLiked: userLikedSet.has(id),
    };
  });

  return {
    store: toPublicStoreDetail(store),
    coupons: mappedCoupons,
    couponsCount: mappedCoupons.length,
  };
}
