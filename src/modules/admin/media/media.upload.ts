import multer from 'multer';
import { UPLOAD_MEDIA } from '../../../config/paths';
import { ensureDir } from '../../../common/utils/fs';

export const uploadMediaFile = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      await ensureDir(UPLOAD_MEDIA);
      cb(null, UPLOAD_MEDIA);
    },
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^\w.\-]+/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
});
