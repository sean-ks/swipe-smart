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
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return response.json();
    },

    async updateProfile(data: ProfileData) {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return response.json();
    },
  },
};
