import { Router } from 'express';
import { requireApiKeyWhenConfigured } from '../../middlewares/requireApiKey';
import { dashboardRouter } from './dashboard/dashboard.routes';
import { permissionsRouter } from './permissions/permissions.routes';
import { usersRouter } from './users/users.routes';
import { networksRouter } from './networks/networks.routes';
import { categoriesRouter } from './categories/categories.routes';
import { storesRouter } from './stores/stores.routes';
import { couponsRouter } from './coupons/coupons.routes';
import { dealsRouter } from './deals/deals.routes';
import { mediaRouter } from './media/media.routes';
import { toolsRouter } from './tools/tools.routes';

export const adminRouter = Router();

adminRouter.use(requireApiKeyWhenConfigured);

adminRouter.use('/dashboard', dashboardRouter);
adminRouter.use('/permissions', permissionsRouter);
adminRouter.use('/users', usersRouter);
adminRouter.use('/networks', networksRouter);
adminRouter.use('/categories', categoriesRouter);
adminRouter.use('/stores', storesRouter);
adminRouter.use('/coupons', couponsRouter);
adminRouter.use('/deals', dealsRouter);
adminRouter.use('/media', mediaRouter);
adminRouter.use('/tools', toolsRouter);
