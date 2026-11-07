import { Response } from 'express';
import { dealService } from '../services/dealService.ts';
import { activityService } from '../services/activityService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getDeals = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { stage } = req.query;
    const deals = dealService.findDeals(stage as string);
    return res.json({ success: true, data: deals });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch deals', error: err.message });
  }
};

export const getDealById = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deal = dealService.findDealById(id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    const activities = activityService.findActivities(undefined, deal.id);
    return res.json({ success: true, data: { ...deal, activities } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch deal details', error: err.message });
  }
};

export const createDeal = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, company, value, stage, expectedCloseDate, assignedTo, contactId, contactName, probability, notes } = req.body;

    if (!title || !company || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Deal title, company, and value are required',
      });
    }

    const deal = dealService.createDeal({
      title,
      company,
      value: Number(value) || 0,
      stage: stage || 'Prospecting',
      expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      assignedTo: assignedTo || req.user?.id || 'usr_exec',
      contactId,
      contactName,
      probability: Number(probability) || 50,
      notes: notes || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: deal,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create deal', error: err.message });
  }
};

export const updateDeal = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = dealService.findDealById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    const updated = dealService.updateDeal(id, updates);

    // If stage changed, log activity via activityService
    if (updates.stage && updates.stage !== existing.stage) {
      activityService.createActivity({
        dealId: id,
        type: 'Note',
        summary: `Pipeline stage moved to ${updates.stage}`,
        details: `Deal progressed from ${existing.stage} to ${updates.stage}.`,
        performedBy: req.user?.id || 'usr_exec',
      });
    }

    return res.json({
      success: true,
      message: 'Deal updated successfully',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update deal', error: err.message });
  }
};

export const deleteDeal = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== 'Admin' && userRole !== 'Sales Manager') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Only Admin and Sales Manager can delete deals',
      });
    }

    const success = dealService.deleteDeal(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    return res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete deal', error: err.message });
  }
};
