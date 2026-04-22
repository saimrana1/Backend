import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody, getValidatedQuery } from '../../../middlewares/validate';
import { idParamSchema } from '../../../common/validation/params';
import * as couponsService from './coupons.service';
import {
  createCouponSchema,
  listCouponsQuerySchema,
  reorderCouponsBodySchema,
  updateCouponSchema,
} from './coupons.validation';

export async function listCoupons(req: Request, res: Response) {
  const q = getValidatedQuery<z.infer<typeof listCouponsQuerySchema>>(req);
  const data = await couponsService.listCoupons({ storeId: q.storeId });
  res.json({ data });
}

export async function createCoupon(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof createCouponSchema>>(req);
  const data = await couponsService.createCoupon(body);
  res.status(201).json({ data });
}

export async function listCouponsOrderedForStore(req: Request, res: Response) {
  const storeId = idParamSchema.parse(req.params.storeId);
  const data = await couponsService.listCouponsForStoreOrdered(storeId);
  res.json({ data });
}

export async function reorderCouponsForStore(req: Request, res: Response) {
  const storeId = idParamSchema.parse(req.params.storeId);
  const { orderedIds } = getValidatedBody<z.infer<typeof reorderCouponsBodySchema>>(req);
  const data = await couponsService.reorderCouponsForStore(storeId, orderedIds);
  res.json({ data });
}

export async function getCouponById(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const data = await couponsService.getCoupon(id);
  res.json({ data });
}

export async function updateCoupon(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const body = getValidatedBody<z.infer<typeof updateCouponSchema>>(req);
  const data = await couponsService.updateCoupon(id, body);
  res.json({ data });
}

export async function deleteCoupon(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  await couponsService.deleteCoupon(id);
  res.status(204).send();
}
