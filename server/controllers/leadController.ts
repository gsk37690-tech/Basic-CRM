import { Response } from 'express';
import { leadService } from '../services/leadService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getLeads = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status, quality, assignedTo, sort, page = '1', limit = '10' } = req.query;

    const allLeads = leadService.findLeads({
      search: search as string,
      status: status as string,
      quality: quality as string,
      assignedTo: assignedTo as string,
      sort: sort as string,
    });

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
    const total = allLeads.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedLeads = allLeads.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      data: paginatedLeads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch leads', error: err.message });
  }
};

export const getLeadById = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const leadDetails = leadService.findLeadWithDetails(id);

    if (!leadDetails) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    return res.json({
      success: true,
      data: leadDetails,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch lead details', error: err.message });
  }
};

export const createLead = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, company, email, phone, source, status, quality, assignedTo, estimatedValue, notes } = req.body;

    // Strict validation
    if (!name || !company || !email) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Lead name, company, and email are required fields',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Please provide a valid email address',
      });
    }

    const currentUserId = req.user?.id || 'usr_exec';
    const newLead = leadService.createLead(
      {
        name,
        company,
        email,
        phone: phone || '',
        source: source || 'Website',
        status: status || 'New',
        quality: quality || 'Warm',
        assignedTo: assignedTo || currentUserId,
        estimatedValue: Number(estimatedValue) || 0,
        notes: notes || '',
      },
      currentUserId
    );

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: newLead,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create lead', error: err.message });
  }
};

export const updateLead = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const currentUserId = req.user?.id || 'usr_exec';

    const updatedLead = leadService.updateLead(id, updates, currentUserId);
    if (!updatedLead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    return res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update lead', error: err.message });
  }
};

export const deleteLead = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    // Delete permission restricted to Admin and Sales Manager
    if (userRole !== 'Admin' && userRole !== 'Sales Manager') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Only Admin and Sales Manager can delete lead records',
      });
    }

    const success = leadService.deleteLead(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Lead not found or already deleted' });
    }

    return res.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete lead', error: err.message });
  }
};

export const convertLead = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { dealTitle, expectedCloseDate } = req.body;

    const result = leadService.convertLead(id, dealTitle, expectedCloseDate);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Lead not found for conversion' });
    }

    return res.json({
      success: true,
      message: 'Lead successfully converted to Contact and Deal',
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to convert lead', error: err.message });
  }
};
