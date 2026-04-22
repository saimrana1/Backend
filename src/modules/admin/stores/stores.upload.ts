import multer from 'multer';
import { UPLOAD_STORES } from '../../../config/paths';
import { ensureDir } from '../../../common/utils/fs';

export const uploadStoreLogo = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      await ensureDir(UPLOAD_STORES);
      cb(null, UPLOAD_STORES);
    },
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
});
