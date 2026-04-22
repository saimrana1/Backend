import { BlogPost, Coupon, Store, User } from '../../../models';

export async function getDashboardStats() {
  const [totalCoupons, blogPosts, stores, users] = await Promise.all([
    Coupon.countDocuments(),
    BlogPost.countDocuments(),
    Store.countDocuments(),
    User.countDocuments(),
  ]);

  return {
    totalCoupons,
    blogPosts,
    stores,
    users,
  };
}
