import type { Request, Response } from 'express';
import * as dashboardService from './dashboard.service';

export async function getDashboardStats(_req: Request, res: Response) {
  const stats = await dashboardService.getDashboardStats();
  res.json({ data: stats });
}
