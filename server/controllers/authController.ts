import { Request, Response } from 'express';
import { authService } from '../services/authService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { UserRole } from '../models/types.ts';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Server-side validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const validRoles: UserRole[] = ['Admin', 'Sales Manager', 'Sales Executive'];
    const assignedRole: UserRole = validRoles.includes(role) ? role : 'Sales Executive';

    const result = await authService.registerUser(name, email, password, assignedRole, phone);
    if (!result) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: result.token,
      user: result.user,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const result = await authService.authenticateUser(email, password);
    if (!result) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    return res.json({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  return res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      createdAt: req.user.createdAt,
    },
  });
};
