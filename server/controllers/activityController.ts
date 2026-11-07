import { Response } from 'express';
import { activityService } from '../services/activityService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getActivities = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { leadId, dealId } = req.query;
    const activities = activityService.findActivities(leadId as string, dealId as string);
    return res.json({ success: true, data: activities });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch activities', error: err.message });
  }
};

export const createActivity = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { leadId, dealId, type, summary, details } = req.body;

    if (!type || !summary) {
      return res.status(400).json({ success: false, message: 'Activity type and summary are required' });
    }

    const activity = activityService.createActivity({
      leadId,
      dealId,
      type,
      summary,
      details: details || '',
      performedBy: req.user?.id || 'usr_exec',
    });

    return res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: activity,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to record activity', error: err.message });
  }
};
