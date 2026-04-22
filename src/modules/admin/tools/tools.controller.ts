import type { Request, Response } from 'express';
import sharp from 'sharp';
import { z } from 'zod';
import { getValidatedBody } from '../../../middlewares/validate';
import { compressImageBodySchema } from './tools.validation';

export async function compressImage(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ error: { message: 'file field is required (multipart/form-data)', code: 'BAD_REQUEST' } });
    return;
  }
  if (!/^image\//.test(req.file.mimetype)) {
    res.status(400).json({ error: { message: 'Only image uploads are allowed', code: 'BAD_REQUEST' } });
    return;
  }

  const { quality } = getValidatedBody<z.infer<typeof compressImageBodySchema>>(req);

  const output = await sharp(req.file.buffer).rotate().jpeg({ quality, mozjpeg: true }).toBuffer();

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Disposition', 'attachment; filename="compressed.jpg"');
  res.send(output);
}
