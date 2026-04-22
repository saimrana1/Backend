import { Router } from 'express';
import { asyncHandler } from '../../../common/utils/asyncHandler';
import { validateBody } from '../../../middlewares/validate';
import * as categoriesController from './categories.controller';
import {
  categoryFeatureBodySchema,
  categorySliderBodySchema,
  createCategorySchema,
  updateCategorySchema,
} from './categories.validation';

export const categoriesRouter = Router();

categoriesRouter.get('/', asyncHandler(categoriesController.listCategories));
categoriesRouter.post('/', validateBody(createCategorySchema), asyncHandler(categoriesController.createCategory));
categoriesRouter.patch(
  '/:id/feature',
  validateBody(categoryFeatureBodySchema),
  asyncHandler(categoriesController.setCategoryFeature),
);
categoriesRouter.patch(
  '/:id/slider',
  validateBody(categorySliderBodySchema),
  asyncHandler(categoriesController.setCategorySlider),
);
categoriesRouter.get('/:id', asyncHandler(categoriesController.getCategoryById));
categoriesRouter.patch('/:id', validateBody(updateCategorySchema), asyncHandler(categoriesController.updateCategory));
categoriesRouter.delete('/:id', asyncHandler(categoriesController.deleteCategory));
