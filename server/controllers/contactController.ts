import { Response } from 'express';
import { contactService } from '../services/contactService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getContacts = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search } = req.query;
    const contacts = contactService.findContacts(search as string);
    return res.json({ success: true, data: contacts });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch contacts', error: err.message });
  }
};

export const getContactById = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contact = contactService.findContactById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    return res.json({ success: true, data: contact });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch contact details', error: err.message });
  }
};

export const createContact = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, company, email, phone, position, notes, assignedTo } = req.body;

    if (!name || !company || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name, company, and email are required fields',
      });
    }

    const contact = contactService.createContact({
      name,
      company,
      email,
      phone: phone || '',
      position: position || 'Contact',
      notes: notes || '',
      assignedTo: assignedTo || req.user?.id || 'usr_exec',
    });

    return res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: contact,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create contact', error: err.message });
  }
};

export const updateContact = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = contactService.updateContact(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    return res.json({
      success: true,
      message: 'Contact updated successfully',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update contact', error: err.message });
  }
};

export const deleteContact = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = contactService.deleteContact(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    return res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete contact', error: err.message });
  }
};
