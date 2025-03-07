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

  async findByFirebaseUid(uid: string): Promise<User | null> {
    const userRef = doc(db, UserRepository.COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() as User : null;
  }

  async createFromFirebase(uid: string, email: string, name?: string, _photoUrl?: string): Promise<User> {
    const now = new Date().toISOString();
    const userData: User = {
      id: uid,
      email,
      name: name || '',
      createdAt: now,
      updatedAt: now,
      settings: {
        theme: 'system',
        notifications: true,
        currency: 'USD'
      }
    };

    const userRef = doc(db, UserRepository.COLLECTION, uid);
    await setDoc(userRef, userData);
    return userData;
  }
} 