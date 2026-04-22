import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../../models';
import { UserRole, UserStatus } from '../../common/constants/enums';
import { env } from '../../config/env';
import { HttpError } from '../../common/utils/httpError';

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRES = '7d';

export function signAccessToken(userId: string, username: string, role: string) {
  return jwt.sign({ username, role }, env.jwtSecret, {
    subject: userId,
    expiresIn: JWT_EXPIRES,
  });
}

type UserLean = {
  _id: mongoose.Types.ObjectId;
  username: string;
  passwordHash: string;
  role: string;
  status: string;
};

export async function loginWithPassword(username: string, password: string) {
  const raw = await User.findOne({ username: username.trim() }).lean();
  if (!raw) {
    throw HttpError.unauthorized('Invalid username or password');
  }
  const user = raw as unknown as UserLean;
  if (user.status !== UserStatus.ACTIVE) {
    throw HttpError.unauthorized('Account is disabled');
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw HttpError.unauthorized('Invalid username or password');
  }

  const id = user._id.toString();
  const token = signAccessToken(id, user.username, user.role);

  return {
    token,
    user: {
      id,
      username: user.username,
      role: user.role,
      status: user.status,
    },
  };
}

export async function registerUser(username: string, password: string) {
  if (!env.authSignupEnabled) {
    throw HttpError.forbidden('Registration is disabled. Set AUTH_SIGNUP_ENABLED=true to allow sign up.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const created = await User.create({
      username: username.trim(),
      passwordHash,
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE,
      networkId: null,
      permissionIds: [],
    });
    const id = created._id.toString();
    const token = signAccessToken(id, created.username, created.role);
    return {
      token,
      user: {
        id,
        username: created.username,
        role: created.role,
        status: created.status,
      },
    };
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: number }).code === 11000) {
      throw HttpError.conflict('Username is already taken');
    }
    throw e;
  }
}

export async function getAuthProfile(userId: string) {
  const raw = await User.findById(userId).select('username role status createdAt updatedAt').lean();
  if (!raw) throw HttpError.unauthorized('User no longer exists');
  const user = raw as unknown as UserLean & { createdAt?: Date; updatedAt?: Date };
  return {
    id: user._id.toString(),
    username: user.username,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt?.toISOString() ?? null,
    updatedAt: user.updatedAt?.toISOString() ?? null,
  };
}
