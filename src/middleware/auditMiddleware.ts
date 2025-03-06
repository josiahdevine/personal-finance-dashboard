import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../lib/prisma';

interface ExtendedRequest extends NextApiRequest {
  user?: {
    id: string;
  };
}

export function auditMiddleware(
  req: ExtendedRequest,
  res: NextApiResponse,
  next: () => void
) {
  const originalEnd = res.end;
  const userId = req.user?.id;

  // @ts-ignore - We need to override the end method
  res.end = function(...args: any[]) {
    if (req.method === 'DELETE') {
      // Log the deletion operation
      void prisma.audit.create({
        data: {
          userId: userId || 'anonymous',
          action: 'DELETE',
          resource: req.url || 'unknown',
          details: {
            method: req.method,
            url: req.url,
            query: req.query,
            body: req.body,
          },
        },
      });
    }

    // Call the original end method
    originalEnd.apply(res, args);
  };

  next();
} 