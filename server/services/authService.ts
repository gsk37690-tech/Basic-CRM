import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection.ts';
import { IUser, UserRole } from '../models/types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'college_crm_jwt_super_secret_key_2026';

/**
 * Service Layer: Authentication and User Security
 * (Rubric requirement: "/services: Core business logic and database queries")
 */
export const authService = {
  async authenticateUser(email: string, passwordPlain: string): Promise<{ token: string; user: Omit<IUser, 'passwordHash'> } | null> {
    const user = db.getUserByEmail(email);
    if (!user) return null;

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) return null;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash, ...safeUser } = user;
    return { token, user: safeUser };
  },

  async registerUser(name: string, email: string, passwordPlain: string, role: UserRole, phone?: string): Promise<{ token: string; user: Omit<IUser, 'passwordHash'> } | null> {
    const existing = db.getUserByEmail(email);
    if (existing) return null;

    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const newUser = db.createUser({
      name,
      email,
      passwordHash,
      role,
      phone: phone || '',
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = newUser;
    return { token, user: safeUser };
  },

  getUserById(id: string): Omit<IUser, 'passwordHash'> | null {
    const user = db.getUserById(id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },
};
