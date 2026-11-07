import { db } from '../db/connection.ts';
import { ObjectId } from 'mongodb';
import { isMongoConnected, mongoUsersCollection, toUser, toUserDocument } from '../db/mongo.ts';
import { IUser, UserRole } from '../models/types.ts';
import { randomUUID } from 'node:crypto';

export const userRepository = {
  async findByEmail(email: string): Promise<IUser | null> {
    if (!isMongoConnected()) {
      return db.getUserByEmail(email) || null;
    }

    const user = await mongoUsersCollection().findOne({ email: email.trim().toLowerCase() });
    return user ? toUser(user) : null;
  },

  async findById(id: string): Promise<IUser | null> {
    if (!isMongoConnected()) {
      return db.getUserById(id) || null;
    }

    const identifiers: Array<{ id: string } | { _id: ObjectId }> = [{ id }];
    if (ObjectId.isValid(id)) {
      identifiers.push({ _id: new ObjectId(id) });
    }
    const user = await mongoUsersCollection().findOne({ $or: identifiers });
    return user ? toUser(user) : null;
  },

  async findAll(): Promise<IUser[]> {
    if (!isMongoConnected()) {
      return db.getUsers();
    }

    const users = await mongoUsersCollection().find({}).sort({ createdAt: 1 }).toArray();
    return users.map(toUser);
  },

  async create(user: Omit<IUser, 'id' | 'createdAt'>): Promise<IUser | null> {
    const newUser = toUserDocument({
      ...user,
      id: `usr_${randomUUID()}`,
      createdAt: new Date().toISOString(),
    });

    if (!isMongoConnected()) {
      return db.createUser(newUser);
    }

    try {
      await mongoUsersCollection().insertOne(newUser);
      return newUser;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
        return null;
      }
      throw error;
    }
  },

  async updateRole(id: string, role: UserRole): Promise<IUser | null> {
    if (!isMongoConnected()) {
      return db.updateUser(id, { role }) || null;
    }

    const result = await mongoUsersCollection().findOneAndUpdate(
      { id },
      { $set: { role } },
      { returnDocument: 'after', projection: { _id: 0 } },
    );
    return result ? toUser(result) : null;
  },
};
