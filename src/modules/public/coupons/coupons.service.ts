import mongoose from 'mongoose';
import { Coupon, CouponInteraction, CouponComment, CashbackTransaction, Store } from '../../../models';
import { HttpError } from '../../../common/utils/httpError';

/* ───────── mappers ───────── */

type CouponLean = {
  _id: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name?: string; logoUrl?: string };
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
};

function mapPublicCoupon(c: CouponLean, extra?: { likesCount?: number; usesCount?: number; userLiked?: boolean }) {
  const raw = c.storeId;
  const storeIdStr =
    raw && typeof raw === 'object' && '_id' in raw
      ? (raw as { _id: mongoose.Types.ObjectId })._id.toString()
      : (raw as mongoose.Types.ObjectId).toString();
  const storeName =
    raw && typeof raw === 'object' && 'name' in raw ? String((raw as { name?: unknown }).name ?? '') : '';
  const storeLogo =
    raw && typeof raw === 'object' && 'logoUrl' in raw
      ? ((raw as { logoUrl?: string }).logoUrl ?? null)
      : null;

  return {
    id: c._id.toString(),
    storeId: storeIdStr,
    storeName,
    storeLogo,
    title: c.title,
    offerDetails: c.offerDetails,
    couponCode: c.couponCode,
    destinationUrl: c.destinationUrl,
    descriptionHtml: c.descriptionHtml,
    featured: c.featured,
    likesCount: extra?.likesCount ?? 0,
    usesCount: extra?.usesCount ?? 0,
    userLiked: extra?.userLiked ?? false,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

/* ───────── list ───────── */

export async function listPublicCoupons(filters: {
  category?: string;
  storeId?: string;
  search?: string;
  page: number;
  limit: number;
  userId?: string;
}) {
  const query: Record<string, unknown> = { active: true };

  if (filters.storeId) {
    query.storeId = new mongoose.Types.ObjectId(filters.storeId);
  }

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { offerDetails: { $regex: filters.search, $options: 'i' } },
    ];
  }

  // If category filter is provided, first find store IDs in that category
  if (filters.category && !filters.storeId) {
    const storesInCategory = await Store.find()
      .populate('categories', 'name slug')
      .lean();

    const matchingStoreIds = storesInCategory
      .filter((s: any) => {
        const cats = (s.categories ?? []) as { name?: string; slug?: string }[];
        return cats.some(
          (cat) =>
            cat.name?.toLowerCase() === filters.category!.toLowerCase() ||
            cat.slug?.toLowerCase() === filters.category!.toLowerCase(),
        );
      })
      .map((s: any) => s._id);

    if (matchingStoreIds.length === 0) {
      return { data: [], pagination: { page: filters.page, limit: filters.limit, total: 0, totalPages: 0 } };
    }
    query.storeId = { $in: matchingStoreIds };
  }

  const skip = (filters.page - 1) * filters.limit;
  const [rows, total] = await Promise.all([
    Coupon.find(query)
      .sort({ featured: -1, sortOrder: 1, _id: -1 })
      .skip(skip)
      .limit(filters.limit)
      .populate('storeId', 'name logoUrl')
      .lean(),
    Coupon.countDocuments(query),
  ]);

  // Batch-fetch interaction counts for all returned coupons
  const couponIds = rows.map((r: any) => r._id);

  const [likesCounts, usesCounts, userLikes] = await Promise.all([
    CouponInteraction.aggregate([
      { $match: { coupon: { $in: couponIds }, action: 'like' } },
      { $group: { _id: '$coupon', count: { $sum: 1 } } },
    ]),
    CouponInteraction.aggregate([
      { $match: { coupon: { $in: couponIds }, action: 'use' } },
      { $group: { _id: '$coupon', count: { $sum: 1 } } },
    ]),
    filters.userId
      ? CouponInteraction.find({
          user: new mongoose.Types.ObjectId(filters.userId),
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

  const data = rows.map((row: any) => {
    const id = row._id.toString();
    return mapPublicCoupon(row as unknown as CouponLean, {
      likesCount: likesMap.get(id) ?? 0,
      usesCount: usesMap.get(id) ?? 0,
      userLiked: userLikedSet.has(id),
    });
  });

  return {
    data,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

/* ───────── detail ───────── */

export async function getCouponDetail(couponId: string, userId?: string) {
  const c = await Coupon.findOne({ _id: couponId, active: true })
    .populate('storeId', 'name logoUrl')
    .lean();
  if (!c) throw HttpError.notFound('Coupon');

  const oid = new mongoose.Types.ObjectId(couponId);
  const [likesCount, usesCount, userLiked] = await Promise.all([
    CouponInteraction.countDocuments({ coupon: oid, action: 'like' }),
    CouponInteraction.countDocuments({ coupon: oid, action: 'use' }),
    userId
      ? CouponInteraction.exists({
          user: new mongoose.Types.ObjectId(userId),
          coupon: oid,
          action: 'like',
        })
      : Promise.resolve(null),
  ]);

  return mapPublicCoupon(c as unknown as CouponLean, {
    likesCount,
    usesCount,
    userLiked: !!userLiked,
  });
}

/* ───────── use coupon ───────── */

export async function useCoupon(couponId: string, userId: string) {
  const coupon = await Coupon.findOne({ _id: couponId, active: true }).lean();
  if (!coupon) throw HttpError.notFound('Coupon');

  const couponOid = new mongoose.Types.ObjectId(couponId);
  const userOid = new mongoose.Types.ObjectId(userId);

  // Check if already used
  const alreadyUsed = await CouponInteraction.exists({
    user: userOid,
    coupon: couponOid,
    action: 'use',
  });
  if (alreadyUsed) {
    throw HttpError.conflict('You have already used this coupon');
  }

  // Record the interaction
  await CouponInteraction.create({ user: userOid, coupon: couponOid, action: 'use' });

  // Create a pending cashback transaction
  const storeId = (coupon as any).storeId;
  let cashbackAmount = 0;

  // Try to look up the store's cashbackRate (if present on Store model)
  const store = await Store.findById(storeId).lean();
  if (store && typeof (store as any).cashbackRate === 'number') {
    // cashbackRate is a percentage — for demonstration, assume a base purchase of 100
    cashbackAmount = (store as any).cashbackRate;
  }

  if (cashbackAmount > 0) {
    await CashbackTransaction.create({
      user: userOid,
      coupon: couponOid,
      store: storeId,
      cashbackAmount,
      status: 'pending',
    });
  }

  return {
    message: 'Coupon used successfully',
    couponCode: (coupon as any).couponCode ?? null,
    cashbackPending: cashbackAmount,
  };
}

/* ───────── like / unlike ───────── */

export async function toggleLike(couponId: string, userId: string) {
  const coupon = await Coupon.findOne({ _id: couponId, active: true }).select('_id').lean();
  if (!coupon) throw HttpError.notFound('Coupon');

  const couponOid = new mongoose.Types.ObjectId(couponId);
  const userOid = new mongoose.Types.ObjectId(userId);

  const existing = await CouponInteraction.findOne({
    user: userOid,
    coupon: couponOid,
    action: 'like',
  });

  if (existing) {
    await CouponInteraction.deleteOne({ _id: existing._id });
    const likesCount = await CouponInteraction.countDocuments({ coupon: couponOid, action: 'like' });
    return { liked: false, likesCount };
  }

  await CouponInteraction.create({ user: userOid, coupon: couponOid, action: 'like' });
  const likesCount = await CouponInteraction.countDocuments({ coupon: couponOid, action: 'like' });
  return { liked: true, likesCount };
}

/* ───────── comments ───────── */

export async function listComments(couponId: string, page: number, limit: number) {
  const coupon = await Coupon.findById(couponId).select('_id').lean();
  if (!coupon) throw HttpError.notFound('Coupon');

  const couponOid = new mongoose.Types.ObjectId(couponId);
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    CouponComment.find({ coupon: couponOid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username')
      .lean(),
    CouponComment.countDocuments({ coupon: couponOid }),
  ]);

  const data = rows.map((r: any) => ({
    id: r._id.toString(),
    userId: r.user?._id?.toString() ?? null,
    username: r.user?.username ?? 'Anonymous',
    text: r.text,
    createdAt: r.createdAt?.toISOString() ?? null,
  }));

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function addComment(couponId: string, userId: string, text: string) {
  const coupon = await Coupon.findOne({ _id: couponId, active: true }).select('_id').lean();
  if (!coupon) throw HttpError.notFound('Coupon');

  const comment = await CouponComment.create({
    user: new mongoose.Types.ObjectId(userId),
    coupon: new mongoose.Types.ObjectId(couponId),
    text,
  });

  const populated = await CouponComment.findById(comment._id).populate('user', 'username').lean();
  const r = populated as any;

  return {
    id: r._id.toString(),
    userId: r.user?._id?.toString() ?? null,
    username: r.user?.username ?? 'Anonymous',
    text: r.text,
    createdAt: r.createdAt?.toISOString() ?? null,
  };
}
