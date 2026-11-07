import { Response } from 'express';
import { db } from '../db/connection.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getUsers = (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.getUsers().map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      createdAt: u.createdAt,
    }));
    return res.json({ success: true, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch team users', error: err.message });
  }
};

export const updateUserRole = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const updated = db.updateUser(id, { role });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update user role', error: err.message });
  }
};
