import mongoose from 'mongoose';
import { CashbackTransaction, User, Feedback } from '../../../models';
import { HttpError } from '../../../common/utils/httpError';

/* ───────── confirm cashback ───────── */

export async function confirmCashback(transactionId: string) {
  const tx = await CashbackTransaction.findById(transactionId).lean();
  if (!tx) throw HttpError.notFound('CashbackTransaction');

  const txDoc = tx as any;
  if (txDoc.status !== 'pending') {
    throw HttpError.badRequest(`Transaction is already "${txDoc.status}", cannot confirm`);
  }

  // Update transaction status
  await CashbackTransaction.findByIdAndUpdate(transactionId, { $set: { status: 'confirmed' } });

  // Credit user balance and add wallet history entry
  await User.findByIdAndUpdate(txDoc.user, {
    $inc: { cashbackBalance: txDoc.cashbackAmount },
    $push: {
      walletHistory: {
        amount: txDoc.cashbackAmount,
        type: 'earned',
        date: new Date(),
      },
    },
  });

  return {
    transactionId: txDoc._id.toString(),
    userId: txDoc.user.toString(),
    cashbackAmount: txDoc.cashbackAmount,
    status: 'confirmed',
    message: 'Cashback confirmed and credited to user',
  };
}

/* ───────── list pending cashback ───────── */

export async function listCashbackTransactions(filters: {
  status?: string;
  page: number;
  limit: number;
}) {
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;

  const skip = (filters.page - 1) * filters.limit;
  const [rows, total] = await Promise.all([
    CashbackTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(filters.limit)
      .populate('user', 'username')
      .populate('coupon', 'title')
      .populate('store', 'name')
      .lean(),
    CashbackTransaction.countDocuments(query),
  ]);

  const data = rows.map((tx: any) => ({
    id: tx._id.toString(),
    userId: tx.user?._id?.toString() ?? null,
    username: tx.user?.username ?? null,
    couponId: tx.coupon?._id?.toString() ?? null,
    couponTitle: tx.coupon?.title ?? null,
    storeId: tx.store?._id?.toString() ?? null,
    storeName: tx.store?.name ?? null,
    cashbackAmount: tx.cashbackAmount,
    status: tx.status,
    withdrawMethod: tx.withdrawMethod ?? null,
    createdAt: tx.createdAt?.toISOString() ?? null,
    updatedAt: tx.updatedAt?.toISOString() ?? null,
  }));

  return {
    data,
    pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  };
}

/* ───────── feature feedback ───────── */

export async function setFeedbackFeatured(feedbackId: string, featured: boolean) {
  const updated = await Feedback.findByIdAndUpdate(
    feedbackId,
    { $set: { featured } },
    { new: true },
  ).lean();
  if (!updated) throw HttpError.notFound('Feedback');

  const r = updated as any;
  return {
    id: r._id.toString(),
    name: r.name,
    featured: r.featured,
    message: featured ? 'Feedback marked as featured' : 'Feedback unfeatured',
  };
}
