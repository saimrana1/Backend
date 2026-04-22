import mongoose from 'mongoose';
import { Network, User } from '../../../models';
import { NetworkStatus } from '../../../common/constants/enums';
import { HttpError } from '../../../common/utils/httpError';

const STATUS_VALUES = new Set<string>(Object.values(NetworkStatus));

function assertNetworkStatus(status: string): asserts status is NetworkStatus {
  if (!STATUS_VALUES.has(status)) {
    throw HttpError.badRequest(`Invalid status. Allowed: ${[...STATUS_VALUES].join(', ')}`);
  }
}

function toNetworkResponse(
  n: {
    _id: mongoose.Types.ObjectId;
    name: string;
    trackingUrl: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  },
  assignedUsers: number,
) {
  return {
    id: n._id.toString(),
    name: n.name,
    trackingUrl: n.trackingUrl,
    status: n.status,
    assignedUsers,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  };
}

export async function listNetworks() {
  const rows = await Network.find().sort({ createdAt: 1 }).lean();
  const out = [];
  for (const n of rows) {
    const nid = (n as unknown as { _id: mongoose.Types.ObjectId })._id;
    const assignedUsers = await User.countDocuments({ networkId: nid });
    out.push(toNetworkResponse(n as unknown as Parameters<typeof toNetworkResponse>[0], assignedUsers));
  }
  return out;
}

export async function createNetwork(input: { name: string; trackingUrl?: string | null }) {
  const net = await Network.create({
    name: input.name,
    trackingUrl: input.trackingUrl ?? null,
    status: NetworkStatus.ACTIVE,
  });
  const doc = net.toObject();
  return toNetworkResponse(doc as unknown as Parameters<typeof toNetworkResponse>[0], 0);
}

export async function getNetwork(id: string) {
  const n = await Network.findById(id).lean();
  if (!n) throw HttpError.notFound('Network');
  const assignedUsers = await User.countDocuments({ networkId: id });
  return toNetworkResponse(n as unknown as Parameters<typeof toNetworkResponse>[0], assignedUsers);
}

export async function updateNetwork(id: string, input: { name?: string; trackingUrl?: string | null; status?: string }) {
  if (input.status !== undefined) assertNetworkStatus(input.status);

  const $set: Record<string, unknown> = {};
  if (input.name !== undefined) $set.name = input.name;
  if (input.trackingUrl !== undefined) $set.trackingUrl = input.trackingUrl;
  if (input.status !== undefined) $set.status = input.status;

  const n = await Network.findByIdAndUpdate(id, { $set }, { new: true }).lean();
  if (!n) throw HttpError.notFound('Network');
  const assignedUsers = await User.countDocuments({ networkId: id });
  return toNetworkResponse(n as unknown as Parameters<typeof toNetworkResponse>[0], assignedUsers);
}

export async function setNetworkStatus(id: string, status: string) {
  assertNetworkStatus(status);
  const n = await Network.findByIdAndUpdate(id, { $set: { status } }, { new: true }).lean();
  if (!n) throw HttpError.notFound('Network');
  const assignedUsers = await User.countDocuments({ networkId: id });
  return toNetworkResponse(n as unknown as Parameters<typeof toNetworkResponse>[0], assignedUsers);
}

export async function deleteNetwork(id: string) {
  const oid = new mongoose.Types.ObjectId(id);
  await User.updateMany({ networkId: oid }, { $set: { networkId: null } });
  const r = await Network.findByIdAndDelete(id);
  if (!r) throw HttpError.notFound('Network');
}
