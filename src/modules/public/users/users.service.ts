import mongoose from 'mongoose';
import { User, CashbackTransaction } from '../../../models';
import { HttpError } from '../../../common/utils/httpError';

/* ───────── types ───────── */

type UserLean = {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string | null;
  role: string;
  status: string;
  cashbackBalance: number;
  walletHistory: { amount: number; type: string; date: Date }[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/* ───────── profile ───────── */

export async function getProfile(userId: string) {
  const raw = await User.findById(userId)
    .select('username email role status cashbackBalance isVerified createdAt updatedAt')
    .lean();
  if (!raw) throw HttpError.notFound('User');
  const u = raw as unknown as UserLean;

  return {
    id: u._id.toString(),
    username: u.username,
    email: u.email ?? null,
    role: u.role,
    status: u.status,
    cashbackBalance: u.cashbackBalance ?? 0,
    isVerified: u.isVerified ?? false,
    createdAt: u.createdAt?.toISOString() ?? null,
    updatedAt: u.updatedAt?.toISOString() ?? null,
  };
}

export async function updateProfile(
  userId: string,
  input: { username?: string; email?: string | null },
) {
  const $set: Record<string, unknown> = {};
  if (input.username !== undefined) $set.username = input.username;
  if (input.email !== undefined) $set.email = input.email;

  try {
    const updated = await User.findByIdAndUpdate(userId, { $set }, { new: true })
      .select('username email role status cashbackBalance isVerified createdAt updatedAt')
      .lean();
    if (!updated) throw HttpError.notFound('User');
    const u = updated as unknown as UserLean;

    return {
      id: u._id.toString(),
      username: u.username,
      email: u.email ?? null,
      role: u.role,
      status: u.status,
      cashbackBalance: u.cashbackBalance ?? 0,
      isVerified: u.isVerified ?? false,
      createdAt: u.createdAt?.toISOString() ?? null,
      updatedAt: u.updatedAt?.toISOString() ?? null,
    };
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: number }).code === 11000) {
      throw HttpError.conflict('Username is already taken');
    }
    throw e;
  }
}

/* ───────── cashback ───────── */

export async function getCashbackInfo(
  userId: string,
  filters: { page: number; limit: number; status?: string },
) {
  const userOid = new mongoose.Types.ObjectId(userId);

  // Fetch current balance
  const user = await User.findById(userId).select('cashbackBalance walletHistory').lean();
  if (!user) throw HttpError.notFound('User');
  const u = user as unknown as Pick<UserLean, 'cashbackBalance' | 'walletHistory'>;

  // Fetch transactions with pagination
  const txQuery: Record<string, unknown> = { user: userOid };
  if (filters.status) txQuery.status = filters.status;

  const skip = (filters.page - 1) * filters.limit;
  const [transactions, total] = await Promise.all([
    CashbackTransaction.find(txQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(filters.limit)
      .populate('coupon', 'title')
      .populate('store', 'name')
      .lean(),
    CashbackTransaction.countDocuments(txQuery),
  ]);

  const mappedTransactions = transactions.map((tx: any) => ({
    id: tx._id.toString(),
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
    balance: u.cashbackBalance ?? 0,
    walletHistory: (u.walletHistory ?? []).slice(-20).reverse().map((entry) => ({
      amount: entry.amount,
      type: entry.type,
      date: entry.date?.toISOString() ?? null,
    })),
    transactions: {
      data: mappedTransactions,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    },
  };
}

/* ───────── withdraw ───────── */

export async function withdrawCashback(
  userId: string,
  input: { method: 'bank' | 'wallet' | 'voucher'; amount: number },
) {
  const userOid = new mongoose.Types.ObjectId(userId);

  // Atomic check and decrement balance
  const user = await User.findOneAndUpdate(
    { _id: userOid, cashbackBalance: { $gte: input.amount } },
    {
      $inc: { cashbackBalance: -input.amount },
      $push: {
        walletHistory: {
          amount: input.amount,
          type: 'withdrawn',
          date: new Date(),
        },
      },
    },
    { new: true },
  ).lean();

  if (!user) {
    // Distinguish between user-not-found and insufficient balance
    const exists = await User.exists({ _id: userOid });
    if (!exists) throw HttpError.notFound('User');
    throw HttpError.badRequest('Insufficient cashback balance');
  }

  // Record the withdrawal transaction
  const tx = await CashbackTransaction.create({
    user: userOid,
    cashbackAmount: input.amount,
    status: 'withdrawn',
    withdrawMethod: input.method,
  });

  return {
    message: 'Withdrawal successful',
    withdrawnAmount: input.amount,
    method: input.method,
    remainingBalance: (user as any).cashbackBalance,
    transactionId: tx._id.toString(),
  };
}
