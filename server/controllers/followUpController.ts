import { Response } from 'express';
import { followUpService } from '../services/followUpService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getFollowUps = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, assignedTo } = req.query;
    const followUps = followUpService.findFollowUps({
      status: status as string,
      assignedTo: assignedTo as string,
    });
    return res.json({ success: true, data: followUps });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch follow-ups', error: err.message });
  }
};

export const createFollowUp = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { leadId, scheduledDate, scheduledTime, type, notes, assignedTo } = req.body;

    if (!leadId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Lead ID, scheduled date, and scheduled time are required',
      });
    }

    const followUp = followUpService.createFollowUp({
      leadId,
      scheduledDate,
      scheduledTime,
      type: type || 'Call',
      status: 'Pending',
      notes: notes || '',
      assignedTo: assignedTo || req.user?.id || 'usr_exec',
    });

    return res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: followUp,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to schedule follow-up', error: err.message });
  }
};

export const updateFollowUp = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.status === 'Completed' && !updates.completedAt) {
      updates.completedAt = new Date().toISOString();
    }

    const updated = followUpService.updateFollowUp(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    return res.json({
      success: true,
      message: 'Follow-up updated successfully',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update follow-up', error: err.message });
  }
};

export const deleteFollowUp = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = followUpService.deleteFollowUp(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }
    return res.json({ success: true, message: 'Follow-up deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete follow-up', error: err.message });
  }
};
