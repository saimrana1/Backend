import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody } from '../../../middlewares/validate';
import { idParamSchema } from '../../../common/validation/params';
import * as categoriesService from './categories.service';
import {
  categoryFeatureBodySchema,
  categorySliderBodySchema,
  createCategorySchema,
  updateCategorySchema,
} from './categories.validation';

export async function listCategories(_req: Request, res: Response) {
  const data = await categoriesService.listCategories();
  res.json({ data });
}

export async function createCategory(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof createCategorySchema>>(req);
  const data = await categoriesService.createCategory(body);
  res.status(201).json({ data });
}

export async function setCategoryFeature(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const { featureEnabled } = getValidatedBody<z.infer<typeof categoryFeatureBodySchema>>(req);
  const data = await categoriesService.setCategoryFeatureEnabled(id, featureEnabled);
  res.json({ data });
}

export async function setCategorySlider(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const { slider } = getValidatedBody<z.infer<typeof categorySliderBodySchema>>(req);
  const data = await categoriesService.setCategorySlider(id, slider);
  res.json({ data });
}

export async function getCategoryById(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const data = await categoriesService.getCategory(id);
  res.json({ data });
}

export async function updateCategory(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const body = getValidatedBody<z.infer<typeof updateCategorySchema>>(req);
  const data = await categoriesService.updateCategory(id, body);
  res.json({ data });
}

export async function deleteCategory(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  await categoriesService.deleteCategory(id);
  res.status(204).send();
}
