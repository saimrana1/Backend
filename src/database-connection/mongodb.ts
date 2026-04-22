import mongoose from 'mongoose';
import { env } from '../config/env';
import '../models';

let connected = false;

export async function connectMongo(): Promise<void> {
  if (connected) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongodbUri);
  connected = true;
}

export async function disconnectMongo(): Promise<void> {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}
