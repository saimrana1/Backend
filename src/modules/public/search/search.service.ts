import { Coupon, Store } from '../../../models';

export async function unifiedSearch(filters: { q: string; category?: string; limit: number }) {
  const regex = { $regex: filters.q, $options: 'i' };

  // Search coupons
  const couponQuery: Record<string, unknown> = {
    active: true,
    $or: [{ title: regex }, { offerDetails: regex }],
  };
  const couponResults = await Coupon.find(couponQuery)
    .sort({ featured: -1, _id: -1 })
    .limit(filters.limit)
    .populate('storeId', 'name logoUrl')
    .lean();

  const coupons = couponResults.map((c: any) => {
    const store = c.storeId;
    return {
      id: c._id.toString(),
      type: 'coupon' as const,
      title: c.title,
      offerDetails: c.offerDetails,
      couponCode: c.couponCode ?? null,
      storeId: store?._id?.toString() ?? store?.toString() ?? null,
      storeName: store?.name ?? '',
      storeLogo: store?.logoUrl ?? null,
      featured: c.featured,
    };
  });

  // Search stores
  const storeQuery: Record<string, unknown> = {
    status: 'ACTIVE',
    name: regex,
  };
  const storeResults = await Store.find(storeQuery)
    .sort({ featured: -1, _id: -1 })
    .limit(filters.limit)
    .populate('categories', 'name slug')
    .lean();

  // Filter by category if provided
  let filteredStores = storeResults as any[];
  if (filters.category) {
    filteredStores = filteredStores.filter((s) => {
      const cats = (s.categories ?? []) as { name?: string; slug?: string }[];
      return cats.some(
        (cat) =>
          cat.name?.toLowerCase() === filters.category!.toLowerCase() ||
          cat.slug?.toLowerCase() === filters.category!.toLowerCase(),
      );
    });
  }

  const stores = filteredStores.map((s: any) => {
    const cats = (s.categories ?? []) as { name?: string; slug?: string }[];
    return {
      id: s._id.toString(),
      type: 'store' as const,
      name: s.name,
      heading: s.heading ?? '',
      logoUrl: s.logoUrl ?? null,
      featured: s.featured,
      categories: cats.map((c) => c.name ?? ''),
    };
  });

  return { coupons, stores, totalResults: coupons.length + stores.length };
}
