import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from './types';

export class UserRepository {
  private static COLLECTION = 'users';

  static async createUser(userId: string, userData: Partial<User>): Promise<void> {
    const userRef = doc(db, this.COLLECTION, userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  static async getUser(userId: string): Promise<User | null> {
    const userRef = doc(db, this.COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() as User : null;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const userRef = doc(db, this.COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }
} 