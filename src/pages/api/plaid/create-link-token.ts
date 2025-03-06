import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { getSession } from 'next-auth/react';

const PLAID_CLIENT_ID = process.env.NEXT_PUBLIC_PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.NEXT_PUBLIC_PLAID_SECRET;
const PLAID_ENV = process.env.NEXT_PUBLIC_PLAID_ENV || 'sandbox';

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const configs = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Personal Finance Dashboard',
      products: ['transactions', 'auth'] as Products[],
      country_codes: ['US'] as CountryCode[],
      language: 'en',
      webhook: `${process.env.NEXT_PUBLIC_API_URL}/api/plaid/webhook`,
    };

    const createTokenResponse = await plaidClient.linkTokenCreate(configs);
    const linkToken = createTokenResponse.data.link_token;

    return res.status(200).json({ linkToken });
  } catch (error) {
    console.error('Error creating link token:', error);
    return res.status(500).json({ error: 'Failed to create link token' });
  }
}
