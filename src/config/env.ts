import dotenv from 'dotenv';

dotenv.config();

function optionalString(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

function requiredString(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongodbUri: requiredString('MONGODB_URI', 'mongodb://127.0.0.1:27017/cms_admin'),
  adminApiKey: optionalString('ADMIN_API_KEY'),
  isProd: process.env.NODE_ENV === 'production',
};
