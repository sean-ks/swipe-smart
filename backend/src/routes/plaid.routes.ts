import { Router } from 'express';
import crypto from 'crypto';
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from 'plaid';
import { prisma } from '../utils/prisma';
import { AuthRequest, verifyToken } from '../middleware/auth.middleware';

const router = Router();

const plaidEnvName = (process.env.PLAID_ENV || 'sandbox').toLowerCase();
const plaidEnv =
  plaidEnvName === 'development'
    ? PlaidEnvironments.development
    : plaidEnvName === 'production'
      ? PlaidEnvironments.production
      : PlaidEnvironments.sandbox;

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: plaidEnv,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
        'PLAID-SECRET': process.env.PLAID_SECRET_ID || '',
      },
    },
  })
);

const rawEncryptionKey = process.env.PLAID_ENCRYPTION_KEY || '';
const ACTIVE_ENCRYPTION_KEY =
  rawEncryptionKey.length === 32 ? rawEncryptionKey : undefined;
const IV_LENGTH = 16;

const encryptAccessToken = (token: string) => {
  if (!ACTIVE_ENCRYPTION_KEY) return token;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(ACTIVE_ENCRYPTION_KEY),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
};

const decryptAccessToken = (payload: string) => {
  if (!ACTIVE_ENCRYPTION_KEY) return payload;
  const [ivHex, encryptedHex, tagHex] = payload.split(':');
  if (!ivHex || !encryptedHex || !tagHex) {
    throw new Error('Invalid encrypted token payload');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ACTIVE_ENCRYPTION_KEY),
    iv
  );
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
};

async function persistPlaidItem(
  userId: string,
  accessToken: string,
  itemId: string
) {
  const itemResponse = await plaidClient.itemGet({
    access_token: accessToken,
  });
  const institutionId = itemResponse.data.item.institution_id || '';
  let institutionName: string | null = null;
  if (institutionId) {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
    });
    institutionName = institutionResponse.data.institution.name;
  }

  let plaidItem = await prisma.plaidItem.findUnique({ where: { itemId } });

  if (plaidItem) {
    if (plaidItem.userId !== userId) {
      throw new Error('Plaid item does not belong to the user');
    }
    plaidItem = await prisma.plaidItem.update({
      where: { id: plaidItem.id },
      data: {
        accessToken: encryptAccessToken(accessToken),
        institutionId,
        institutionName,
        status: 'ACTIVE',
        errorCode: null,
        lastSuccessfulUpdate: new Date(),
      },
    });
  } else {
    plaidItem = await prisma.plaidItem.create({
      data: {
        userId,
        accessToken: encryptAccessToken(accessToken),
        itemId,
        institutionId,
        institutionName,
        status: 'ACTIVE',
        errorCode: null,
        lastSuccessfulUpdate: new Date(),
      },
    });
  }

  const accountsResponse = await plaidClient.accountsGet({
    access_token: accessToken,
  });

  await Promise.all(
    accountsResponse.data.accounts.map((account) =>
      prisma.plaidAccount.upsert({
        where: { accountId: account.account_id },
        update: {
          plaidItemId: plaidItem!.id,
          name: account.name,
          officialName: account.official_name || null,
          type: account.type,
          subtype: account.subtype || null,
          mask: account.mask || null,
          currentBalance: account.balances.current
            ? Math.round(account.balances.current * 100)
            : null,
          availableBalance: account.balances.available
            ? Math.round(account.balances.available * 100)
            : null,
          isoCurrencyCode: account.balances.iso_currency_code || 'USD',
        },
        create: {
          plaidItemId: plaidItem!.id,
          accountId: account.account_id,
          name: account.name,
          officialName: account.official_name || null,
          type: account.type,
          subtype: account.subtype || null,
          mask: account.mask || null,
          currentBalance: account.balances.current
            ? Math.round(account.balances.current * 100)
            : null,
          availableBalance: account.balances.available
            ? Math.round(account.balances.available * 100)
            : null,
          isoCurrencyCode: account.balances.iso_currency_code || 'USD',
        },
      })
    )
  );

  return plaidItem;
}

router.post(
  '/link-token',
  verifyToken,
  async (req: AuthRequest, res): Promise<void> => {
    try {
      const userId = req.userId!;
      const { plaidItemId } = req.body as { plaidItemId?: string };

      const configs: Record<string, unknown> = {
        user: { client_user_id: userId },
        client_name: 'SwipeSmart',
        language: 'en',
        country_codes: [CountryCode.Us],
      };

      if (plaidItemId) {
        const plaidItem = await prisma.plaidItem.findFirst({
          where: {
            id: plaidItemId,
            userId,
            status: { not: 'DISCONNECTED' },
          },
        });

        if (!plaidItem) {
          res.status(404).json({ error: 'Plaid item not found' });
          return;
        }

        configs.access_token = decryptAccessToken(plaidItem.accessToken);
      } else {
        configs.products = [Products.Transactions];
      }

      const env = (process.env.PLAID_ENV || 'sandbox').toLowerCase();
      if (env === 'sandbox') {
        const response = await plaidClient.sandboxPublicTokenCreate({
          institution_id: 'ins_109511',
          initial_products: [Products.Transactions],
        });
        const exchange = await plaidClient.itemPublicTokenExchange({
          public_token: response.data.public_token,
        });
        await persistPlaidItem(userId, exchange.data.access_token, exchange.data.item_id);
        res.json({
          linkToken: null,
          expiration: null,
          mode: plaidItemId ? 'update' : 'new',
          sandbox: true,
        });
        return;
      }

      const tokenResponse = await plaidClient.linkTokenCreate(configs);

      res.json({
        linkToken: tokenResponse.data.link_token,
        expiration: tokenResponse.data.expiration,
        mode: plaidItemId ? 'update' : 'new',
      });
    } catch (error: any) {
      console.error('Error creating Plaid link token', error.response?.data || error);
      res.status(500).json({
        error: 'Failed to create Plaid link token',
        details: error.response?.data || error.message,
      });
    }
  }
);

router.post(
  '/exchange-public-token',
  verifyToken,
  async (req: AuthRequest, res): Promise<void> => {
    try {
      const userId = req.userId!;
      const { publicToken } = req.body as { publicToken?: string };

      if (!publicToken) {
        res.status(400).json({ error: 'publicToken is required' });
        return;
      }

      const exchangeResponse = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = exchangeResponse.data.access_token;
      const itemId = exchangeResponse.data.item_id;
      const plaidItem = await persistPlaidItem(userId, accessToken, itemId);

      res.json({
        success: true,
        item_id: itemId,
        plaid_item_id: plaidItem.id,
      });
    } catch (error: any) {
      console.error('Error exchanging public token', error.response?.data || error);
      res.status(500).json({
        error: 'Failed to exchange public token',
        details: error.response?.data || error.message,
      });
    }
  }
);

router.get('/items', verifyToken, async (req: AuthRequest, res) => {
  try {
    const items = await prisma.plaidItem.findMany({
      where: {
        userId: req.userId!,
        status: { not: 'DISCONNECTED' },
      },
      select: {
        id: true,
        institutionName: true,
        institutionId: true,
        status: true,
        errorCode: true,
        lastSuccessfulUpdate: true,
        createdAt: true,
        accounts: {
          select: {
            id: true,
            name: true,
            subtype: true,
            mask: true,
            currentBalance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items });
  } catch (error) {
    console.error('Error fetching Plaid items', error);
    res.status(500).json({ error: 'Failed to fetch Plaid items' });
  }
});

router.delete('/items/:itemId', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { itemId } = req.params;
    const plaidItem = await prisma.plaidItem.findFirst({
      where: { id: itemId, userId: req.userId! },
    });

    if (!plaidItem) {
      res.status(404).json({ error: 'Plaid item not found' });
      return;
    }

    await prisma.plaidItem.update({
      where: { id: itemId },
      data: { status: 'DISCONNECTED', updatedAt: new Date() },
    });

    try {
      await plaidClient.itemRemove({
        access_token: decryptAccessToken(plaidItem.accessToken),
      });
    } catch (plaidError) {
      console.warn('Error removing item from Plaid', plaidError);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing Plaid item', error);
    res.status(500).json({ error: 'Failed to remove Plaid item' });
  }
});

router.patch(
  '/items/:itemId/status',
  verifyToken,
  async (req: AuthRequest, res) => {
    try {
      const { itemId } = req.params;
      const { status, errorCode } = req.body as {
        status: 'ACTIVE' | 'LOGIN_REQUIRED' | 'ERROR' | 'DISCONNECTED';
        errorCode?: string | null;
      };

      if (!['ACTIVE', 'LOGIN_REQUIRED', 'ERROR', 'DISCONNECTED'].includes(status)) {
        res.status(400).json({ error: 'Invalid status value' });
        return;
      }

      const plaidItem = await prisma.plaidItem.findFirst({
        where: { id: itemId, userId: req.userId! },
      });

      if (!plaidItem) {
        res.status(404).json({ error: 'Plaid item not found' });
        return;
      }

      await prisma.plaidItem.update({
        where: { id: itemId },
        data: {
          status,
          errorCode: errorCode || null,
          updatedAt: new Date(),
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating Plaid item status', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  }
);

router.post('/transactions', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { plaidItemId, startDate, endDate } = req.body as {
      plaidItemId?: string;
      startDate?: string;
      endDate?: string;
    };

    if (!plaidItemId) {
      res.status(400).json({ error: 'plaidItemId is required' });
      return;
    }

    const plaidItem = await prisma.plaidItem.findFirst({
      where: { id: plaidItemId, userId: req.userId! },
      include: { accounts: true },
    });

    if (!plaidItem) {
      res.status(404).json({ error: 'Plaid item not found' });
      return;
    }

    const accessToken = decryptAccessToken(plaidItem.accessToken);
    const today = new Date();
    const formattedEnd = endDate || today.toISOString().split('T')[0];
    const formattedStart =
      startDate ||
      new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: formattedStart,
      end_date: formattedEnd,
      options: { count: 500, offset: 0 },
    });

    for (const transaction of response.data.transactions) {
      const account = plaidItem.accounts.find(
        (acct) => acct.accountId === transaction.account_id
      );
      if (!account) continue;

      await prisma.plaidTransaction.upsert({
        where: { transactionId: transaction.transaction_id },
        update: {
          amount: Math.round(transaction.amount * 100),
          date: new Date(transaction.date),
          authorizedDate: transaction.authorized_date
            ? new Date(transaction.authorized_date)
            : null,
          name: transaction.name,
          merchantName: transaction.merchant_name || null,
          category: transaction.category || [],
          categoryId: transaction.category_id || null,
          pending: transaction.pending,
          paymentChannel: transaction.payment_channel,
          transactionType: transaction.transaction_type || null,
          personalFinanceCategory: transaction.personal_finance_category as any,
        },
        create: {
          plaidItemId: plaidItem.id,
          plaidAccountId: account.id,
          transactionId: transaction.transaction_id,
          amount: Math.round(transaction.amount * 100),
          isoCurrencyCode: transaction.iso_currency_code || 'USD',
          date: new Date(transaction.date),
          authorizedDate: transaction.authorized_date
            ? new Date(transaction.authorized_date)
            : null,
          name: transaction.name,
          merchantName: transaction.merchant_name || null,
          category: transaction.category || [],
          categoryId: transaction.category_id || null,
          pending: transaction.pending,
          paymentChannel: transaction.payment_channel,
          transactionType: transaction.transaction_type || null,
          personalFinanceCategory: transaction.personal_finance_category as any,
        },
      });
    }

    res.json({
      success: true,
      transactions: response.data.transactions,
      accounts: response.data.accounts,
      total: response.data.total_transactions,
    });
  } catch (error: any) {
    console.error('Error fetching Plaid transactions', error.response?.data || error);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      details: error.response?.data || error.message,
    });
  }
});

router.post('/accounts', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { plaidItemId } = req.body as { plaidItemId?: string };

    if (!plaidItemId) {
      res.status(400).json({ error: 'plaidItemId is required' });
      return;
    }

    const plaidItem = await prisma.plaidItem.findFirst({
      where: { id: plaidItemId, userId: req.userId! },
    });

    if (!plaidItem) {
      res.status(404).json({ error: 'Plaid item not found' });
      return;
    }

    const response = await plaidClient.accountsGet({
      access_token: decryptAccessToken(plaidItem.accessToken),
    });

    res.json({
      success: true,
      accounts: response.data.accounts,
      item: response.data.item,
    });
  } catch (error: any) {
    console.error('Error fetching Plaid accounts', error.response?.data || error);
    res.status(500).json({
      error: 'Failed to fetch accounts',
      details: error.response?.data || error.message,
    });
  }
});

router.post(
  '/sandbox/connect-test-item',
  verifyToken,
  async (req: AuthRequest, res) => {
    try {
      const env = (process.env.PLAID_ENV || 'sandbox').toLowerCase();
      if (env !== 'sandbox') {
        return res
          .status(400)
          .json({ error: 'Sandbox shortcut only available in sandbox environment.' });
      }

      const { institutionId } = req.body as { institutionId?: string };
      const response = await plaidClient.sandboxPublicTokenCreate({
        institution_id: institutionId || 'ins_109511',
        initial_products: [Products.Transactions],
      });

      const exchange = await plaidClient.itemPublicTokenExchange({
        public_token: response.data.public_token,
      });

      const plaidItem = await persistPlaidItem(
        req.userId!,
        exchange.data.access_token,
        exchange.data.item_id
      );

      res.json({
        success: true,
        plaid_item_id: plaidItem.id,
        institutionName: plaidItem.institutionName,
      });
    } catch (error: any) {
      console.error(
        'Error creating sandbox Plaid item',
        error.response?.data || error
      );
      res.status(500).json({
        error: 'Failed to create sandbox Plaid item',
        details: error.response?.data || error.message,
      });
    }
  }
);

export default router;
