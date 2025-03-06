import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);

        // Add user to request
        req.user = {
            id: decodedToken.uid,
            email: decodedToken.email || '',
            firebase_uid: decodedToken.uid
        };

        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
}; 