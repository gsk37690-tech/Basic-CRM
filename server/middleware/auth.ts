import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection.ts';
import { IUser } from '../models/types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'college_crm_jwt_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = db.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token: User does not exist' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export { JWT_SECRET };
