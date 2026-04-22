import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody } from '../../../middlewares/validate';
import { mediaUploadMetaSchema } from './media.validation';

export async function uploadMedia(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: { message: 'file field is required (multipart/form-data)', code: 'BAD_REQUEST' } });
    return;
  }

  const meta = getValidatedBody<z.infer<typeof mediaUploadMetaSchema>>(req);
  const publicUrl = `/uploads/media/${req.file.filename}`;

  res.status(201).json({
    data: {
      url: publicUrl,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      entityType: meta.entityType,
      entityId: meta.entityId ?? null,
    },
  });
}
