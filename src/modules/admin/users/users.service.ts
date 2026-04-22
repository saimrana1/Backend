import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../../../models';
import { Network } from '../../../models';
import { UserRole, UserStatus } from '../../../common/constants/enums';
import { PERMISSION_IDS, isPermissionId } from '../../../common/constants/permissions';
import { HttpError } from '../../../common/utils/httpError';

const BCRYPT_ROUNDS = 12;

const ROLE_VALUES = new Set<string>(Object.values(UserRole));
const STATUS_VALUES = new Set<string>(Object.values(UserStatus));

function assertRole(role: string): asserts role is UserRole {
  if (!ROLE_VALUES.has(role)) {
    throw HttpError.badRequest(`Invalid role. Allowed: ${[...ROLE_VALUES].join(', ')}`);
  }
}

function assertUserStatus(status: string): asserts status is UserStatus {
  if (!STATUS_VALUES.has(status)) {
    throw HttpError.badRequest(`Invalid status. Allowed: ${[...STATUS_VALUES].join(', ')}`);
  }
}

function populatedNetworkName(networkId: unknown): string | null {
  if (networkId == null) return null;
  if (typeof networkId === 'object' && networkId !== null && 'name' in networkId) {
    return String((networkId as { name: string }).name);
  }
  return null;
}

function toUserResponse(doc: {
  _id: mongoose.Types.ObjectId;
  username: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  networkId?: unknown;
}) {
  return {
    id: doc._id.toString(),
    username: doc.username,
    role: doc.role,
    status: doc.status,
    network: populatedNetworkName(doc.networkId),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listUsers() {
  const rows = await User.find().sort({ createdAt: 1 }).populate('networkId', 'name').lean();
  return rows.map((u) => toUserResponse(u as unknown as Parameters<typeof toUserResponse>[0]));
}

export async function createUser(input: {
  username: string;
  password: string;
  role: string;
  networkId?: string | null;
}) {
  assertRole(input.role);
  if (input.networkId) {
    const net = await Network.findById(input.networkId).select('_id').lean();
    if (!net) throw HttpError.badRequest('networkId does not exist');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  try {
    await User.create({
      username: input.username,
      passwordHash,
      role: input.role,
      status: UserStatus.ACTIVE,
      networkId: input.networkId ?? null,
      permissionIds: [],
    });
  } catch (e: unknown) {
    if (isDuplicateKey(e)) throw HttpError.conflict('Username already exists');
    throw e;
  }

  const user = await User.findOne({ username: input.username }).populate('networkId', 'name').lean();
  if (!user) throw new Error('User was created but could not be reloaded');
  return toUserResponse(user as unknown as Parameters<typeof toUserResponse>[0]);
}

export async function getUserById(id: string) {
  const user = await User.findById(id).populate('networkId', 'name').lean();
  if (!user) throw HttpError.notFound('User');

  const permissionIds = (user as { permissionIds?: string[] }).permissionIds ?? [];
  return {
    ...toUserResponse(user as unknown as Parameters<typeof toUserResponse>[0]),
    enabledPermissionIds: permissionIds,
  };
}

export async function updateUser(
  id: string,
  input: { username?: string; password?: string; role?: string; networkId?: string | null },
) {
  if (input.role !== undefined) assertRole(input.role);
  if (input.networkId !== undefined && input.networkId !== null) {
    const net = await Network.findById(input.networkId).select('_id').lean();
    if (!net) throw HttpError.badRequest('networkId does not exist');
  }

  const $set: Record<string, unknown> = {};
  if (input.username !== undefined) $set.username = input.username;
  if (input.role !== undefined) $set.role = input.role;
  if (input.networkId !== undefined) $set.networkId = input.networkId;
  if (input.password !== undefined) {
    $set.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }

  try {
    const user = await User.findByIdAndUpdate(id, { $set }, { new: true }).populate('networkId', 'name').lean();
    if (!user) throw HttpError.notFound('User');
    return toUserResponse(user as unknown as Parameters<typeof toUserResponse>[0]);
  } catch (e: unknown) {
    if (isDuplicateKey(e)) throw HttpError.conflict('Username already exists');
    throw e;
  }
}

export async function setUserStatus(id: string, status: string) {
  assertUserStatus(status);
  const user = await User.findByIdAndUpdate(id, { $set: { status } }, { new: true }).populate('networkId', 'name').lean();
  if (!user) throw HttpError.notFound('User');
  return toUserResponse(user as unknown as Parameters<typeof toUserResponse>[0]);
}

export async function deleteUser(id: string) {
  const r = await User.findByIdAndDelete(id);
  if (!r) throw HttpError.notFound('User');
}

export async function getUserPermissions(id: string) {
  const user = await User.findById(id).select('permissionIds').lean();
  if (!user) throw HttpError.notFound('User');

  const u = user as unknown as { _id: mongoose.Types.ObjectId; permissionIds?: string[] };
  const enabled = new Set(u.permissionIds ?? []);
  const permissions = PERMISSION_IDS.map((pid) => ({ id: pid, enabled: enabled.has(pid) }));
  return { userId: u._id.toString(), permissions };
}

export async function replaceUserPermissions(id: string, enabledPermissionIds: string[]) {
  const exists = await User.findById(id).select('_id').lean();
  if (!exists) throw HttpError.notFound('User');

  for (const pid of enabledPermissionIds) {
    if (!isPermissionId(pid)) {
      throw HttpError.badRequest(`Unknown permission id: ${pid}`);
    }
  }

  await User.findByIdAndUpdate(id, { $set: { permissionIds: enabledPermissionIds } });
  return getUserPermissions(id);
}

function isDuplicateKey(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'code' in e && (e as { code?: number }).code === 11000;
}
