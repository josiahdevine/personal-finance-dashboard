import { BaseRepository } from './BaseRepository';
import { User } from './types';
import { queryOne } from '../db';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const cacheKey = this.getCacheKey(`firebase_${firebaseUid}`);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const result = await queryOne<User>(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );

    if (result) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = this.getCacheKey(`email_${email}`);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const result = await queryOne<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result) {
      this.setCache(cacheKey, result);
    }

    return result;
  }

  async createFromFirebase(
    firebaseUid: string,
    email: string,
    displayName: string | null = null,
    photoUrl: string | null = null
  ): Promise<User> {
    const user = await this.create({
      firebase_uid: firebaseUid,
      email,
      display_name: displayName,
      photo_url: photoUrl,
    });

    return user;
  }
} 