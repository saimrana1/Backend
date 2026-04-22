import type { Request, Response } from 'express';
import { PERMISSION_IDS } from '../../../common/constants/permissions';

export function listPermissionIds(_req: Request, res: Response) {
  res.json({ data: PERMISSION_IDS });
}
