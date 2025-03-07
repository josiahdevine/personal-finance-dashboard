import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

// Simple logging function instead of using prisma.audit
const logAuditEvent = (
  userId: string,
  action: string,
  resource: string,
  details: any
) => {
  console.log(`AUDIT: ${userId} - ${action} - ${resource} - ${JSON.stringify(details)}`);
  // In a real app, this would write to a database or logging service
};

export const auditMiddleware = (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });
    const userId = session?.user?.id;
    const resource = req.url?.split('?')[0] || 'unknown';
    
    if (req.method === 'DELETE') {
      // Log the deletion operation
      logAuditEvent(
        userId || 'anonymous',
        'DELETE',
        resource,
        { body: req.body, query: req.query }
      );
    }
    
    if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
      // Log the write operation
      logAuditEvent(
        userId || 'anonymous',
        req.method || 'UNKNOWN',
        resource,
        { body: req.body }
      );
    }
    
    return handler(req, res);
  };
}; 