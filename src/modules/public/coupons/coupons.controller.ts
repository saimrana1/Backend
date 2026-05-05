import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody, getValidatedQuery } from '../../../middlewares/validate';
import { idParamSchema } from '../../../common/validation/params';
import * as couponsService from './coupons.service';
import {
  listPublicCouponsQuerySchema,
  couponCommentBodySchema,
  listCommentsQuerySchema,
} from './coupons.validation';

export async function listCoupons(req: Request, res: Response) {
  const q = getValidatedQuery<z.infer<typeof listPublicCouponsQuerySchema>>(req);
  const result = await couponsService.listPublicCoupons({
    ...q,
    userId: req.authUser?.userId,
  });
  res.json(result);
}

export async function getCouponById(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const data = await couponsService.getCouponDetail(id, req.authUser?.userId);
  res.json({ data });
}

export async function useCoupon(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const data = await couponsService.useCoupon(id, req.authUser!.userId);
  res.json({ data });
}

export async function toggleLike(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const data = await couponsService.toggleLike(id, req.authUser!.userId);
  res.json({ data });
}

export async function listComments(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const q = getValidatedQuery<z.infer<typeof listCommentsQuerySchema>>(req);
  const result = await couponsService.listComments(id, q.page, q.limit);
  res.json(result);
}

export async function addComment(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const body = getValidatedBody<z.infer<typeof couponCommentBodySchema>>(req);
  const data = await couponsService.addComment(id, req.authUser!.userId, body.text);
  res.status(201).json({ data });
}
