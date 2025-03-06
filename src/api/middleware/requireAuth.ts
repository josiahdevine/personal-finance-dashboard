import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { sql } from '../../db';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firebase_uid: string;
      };
    }
  }
}

interface UserRecord {
  id: string;
  email: string;
  firebase_uid: string;
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);

    // Get user from database using firebase_uid
    const result = await sql`
      SELECT id::text, email, firebase_uid
      FROM users
      WHERE firebase_uid = ${decodedToken.uid}
      LIMIT 1
    `;

    const users = result as unknown as UserRecord[];

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request object
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 