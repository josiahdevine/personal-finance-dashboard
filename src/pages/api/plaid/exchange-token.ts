import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode } from 'plaid';
import { getSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma';

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET': process.env.PLAID_SECRET!,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { publicToken, institutionId } = req.body;

    if (!publicToken || !institutionId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get institution details
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ['US' as CountryCode],
    });

    const institutionName = institutionResponse.data.institution.name;

    // Store the access token and item ID
    await prisma.plaidConnection.create({
      data: {
        userId: session.user.id,
        accessToken,
        itemId,
        institutionId,
        institutionName,
        status: 'active',
      },
    });

    return res.status(200).json({
      success: true,
      institution: {
        id: institutionId,
        name: institutionName,
      },
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return res.status(500).json({
      error: 'Failed to exchange token',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
