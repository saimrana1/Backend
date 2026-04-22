import { createApp } from './app';
import { env } from './config/env';
import { connectMongo } from './database-connection/mongodb';
import { ensureDir } from './common/utils/fs';
import { UPLOAD_MEDIA, UPLOAD_ROOT, UPLOAD_STORES } from './config/paths';

async function main() {
  await connectMongo();
  await ensureDir(UPLOAD_ROOT);
  await ensureDir(UPLOAD_MEDIA);
  await ensureDir(UPLOAD_STORES);

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Admin API listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
