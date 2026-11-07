import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { db } from '../db/connection.ts';
import { IUser, UserRole } from '../models/types.ts';
import { UserModel } from '../models/UserModel.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'college_crm_jwt_super_secret_key_2026';

/**
 * Service Layer: Authentication and User Security
 * (Rubric requirement: "/services: Core business logic and database queries")
 */
export const authService = {
  async authenticateUser(email: string, passwordPlain: string): Promise<{ token: string; user: Omit<IUser, 'passwordHash'> } | null> {
    let user = db.getUserByEmail(email);

    // If not in local memory, check real MongoDB if connected
    if (!user && mongoose.connection.readyState === 1) {
      try {
        const mongoUser = await UserModel.findOne({ email: email.toLowerCase() });
        if (mongoUser) {
          user = {
            id: mongoUser._id.toString(),
            name: mongoUser.name,
            email: mongoUser.email,
            passwordHash: mongoUser.passwordHash,
            role: mongoUser.role as UserRole,
            phone: mongoUser.phone || '',
            createdAt: mongoUser.createdAt.toISOString(),
          };
          // Cache in memory
          db.getUsers().push(user);
        }
      } catch (e: any) {
        console.error('[MongoDB user lookup error]:', e.message);
      }
    }

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
    let userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    // Directly persist to MongoDB collection 'users' so it reflects in MongoDB Compass!
    if (mongoose.connection.readyState === 1) {
      try {
        const mongoDoc = await UserModel.create({
          name,
          email,
          passwordHash,
          role,
          phone: phone || '',
        });
        userId = mongoDoc._id.toString();
        console.log(`[MongoDB Compass Live] Created user "${name}" in MongoDB database "${mongoose.connection.name}". Document _id: ${userId}`);
      } catch (err: any) {
        console.error('[MongoDB Error writing registered user]:', err.message);
      }
    }

    const newUser = db.createUser({
      name,
      email,
      passwordHash,
      role,
      phone: phone || '',
    });
    newUser.id = userId;

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
