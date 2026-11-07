import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.ts';
import { UserRole } from '../models/types.ts';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Action requires one of [${allowedRoles.join(', ')}] permissions. Current role is: ${req.user.role}`,
      });
    }

    next();
  };
};
