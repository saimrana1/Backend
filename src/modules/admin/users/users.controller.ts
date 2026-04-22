import type { Request, Response } from 'express';
import { z } from 'zod';
import { getValidatedBody } from '../../../middlewares/validate';
import { idParamSchema } from '../../../common/validation/params';
import * as usersService from './users.service';
import {
  createUserSchema,
  updateUserSchema,
  userPermissionsBodySchema,
  userStatusBodySchema,
} from './users.validation';

export async function listUsers(_req: Request, res: Response) {
  const data = await usersService.listUsers();
  res.json({ data });
}

export async function createUser(req: Request, res: Response) {
  const body = getValidatedBody<z.infer<typeof createUserSchema>>(req);
  const data = await usersService.createUser(body);
  res.status(201).json({ data });
}

export async function getUserPermissions(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const data = await usersService.getUserPermissions(id);
  res.json({ data });
}

export async function replaceUserPermissions(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const { enabledPermissionIds } = getValidatedBody<z.infer<typeof userPermissionsBodySchema>>(req);
  const data = await usersService.replaceUserPermissions(id, enabledPermissionIds);
  res.json({ data });
}

export async function setUserStatus(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const { status } = getValidatedBody<z.infer<typeof userStatusBodySchema>>(req);
  const data = await usersService.setUserStatus(id, status);
  res.json({ data });
}

export async function getUserById(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const data = await usersService.getUserById(id);
  res.json({ data });
}

export async function updateUser(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  const body = getValidatedBody<z.infer<typeof updateUserSchema>>(req);
  const data = await usersService.updateUser(id, body);
  res.json({ data });
}

export async function deleteUser(req: Request, res: Response) {
  const id = idParamSchema.parse(req.params.id);
  await usersService.deleteUser(id);
  res.status(204).send();
}
