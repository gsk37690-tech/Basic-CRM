import { Response } from 'express';
import { db } from '../db/connection.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getDashboardStats = (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    return res.json({ success: true, data: stats });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to aggregate dashboard metrics', error: err.message });
  }
};

export const resetData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.resetDemoData();
    return res.json({ success: true, message: 'Demo college CRM database reset to default state' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to reset demo data', error: err.message });
  }
};
