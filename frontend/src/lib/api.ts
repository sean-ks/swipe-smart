import { supabase } from './supabase';

const API_BASE = '/api';

export interface CompleteProfileData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  creditHistoryAge?: string;
  creditScore?: number;
  knowsCreditScore?: boolean;
  travelGoal?: string;
  diningGoal?: string;
  buildCreditGoal?: string;
  cashbackGoal?: string;
  onlineShoppingGoal?: string;
}

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  creditHistoryAge?: string;
  creditScore?: number;
  knowsCreditScore?: boolean;
  travelGoal?: string;
  diningGoal?: string;
  buildCreditGoal?: string;
  cashbackGoal?: string;
  onlineShoppingGoal?: string;
}

export interface PlaidAccountSummary {
  id: string;
  name: string;
  subtype: string | null;
  mask: string | null;
  currentBalance: number | null;
}

export interface PlaidItemSummary {
  id: string;
  institutionName: string | null;
  institutionId: string | null;
  status: 'ACTIVE' | 'LOGIN_REQUIRED' | 'ERROR' | 'DISCONNECTED';
  errorCode: string | null;
  lastSuccessfulUpdate: string | null;
  createdAt: string;
  accounts: PlaidAccountSummary[];
}

async function authorizedFetch(
  path: string,
  init: RequestInit = {},
  options: { json?: boolean } = {}
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('You must be signed in to perform this action.');
  }

  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${session.access_token}`);

  const shouldSendJson =
    options.json !== false &&
    init.body !== undefined &&
    !headers.has('Content-Type');

  if (shouldSendJson) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let details: any = null;
    try {
      details = await response.json();
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(details?.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    async createProfile(profileData: CompleteProfileData) {
      const response = await fetch(`${API_BASE}/auth/create-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create profile');
      }

      return response.json();
    },

    async getProfile() {
      return authorizedFetch('/auth/profile');
    },

    async updateProfile(data: ProfileData) {
      return authorizedFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  plaid: {
    async createLinkToken(plaidItemId?: string) {
      return authorizedFetch('/plaid/link-token', {
        method: 'POST',
        body: JSON.stringify({ plaidItemId }),
      });
    },

    async exchangePublicToken(publicToken: string) {
      return authorizedFetch('/plaid/exchange-public-token', {
        method: 'POST',
        body: JSON.stringify({ publicToken }),
      });
    },

    async getItems() {
      return authorizedFetch('/plaid/items');
    },

    async removeItem(itemId: string) {
      return authorizedFetch(`/plaid/items/${itemId}`, {
        method: 'DELETE',
      });
    },

    async updateItemStatus(itemId: string, status: PlaidItemSummary['status'], errorCode?: string) {
      return authorizedFetch(`/plaid/items/${itemId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, errorCode }),
      });
    },

    async fetchTransactions(plaidItemId: string) {
      return authorizedFetch('/plaid/transactions', {
        method: 'POST',
        body: JSON.stringify({ plaidItemId }),
      });
    },

    async refreshAccounts(plaidItemId: string) {
      return authorizedFetch('/plaid/accounts', {
        method: 'POST',
        body: JSON.stringify({ plaidItemId }),
      });
    },
  },
};
