import path from 'node:path';

export const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');
export const UPLOAD_MEDIA = path.join(UPLOAD_ROOT, 'media');
export const UPLOAD_STORES = path.join(UPLOAD_ROOT, 'stores');
