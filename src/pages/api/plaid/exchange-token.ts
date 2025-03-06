import { Request, Response } from 'express';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { auth } from 'firebase-admin';
import { db } from '../../../config/firebase-admin';

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Firebase auth token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { public_token } = req.body;
    if (!public_token) {
      return res.status(400).json({ error: 'Missing public token' });
    }

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Store the access token in Firestore
    await db.collection('plaidConnections').doc(itemId).set({
      userId,
      accessToken,
      itemId,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return res.status(500).json({ error: 'Failed to exchange token' });
  }
}
