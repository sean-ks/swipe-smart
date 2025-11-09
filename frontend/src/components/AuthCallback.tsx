import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

interface AuthCallbackProps {
  onNavigate: (screen: string) => void;
}

const AuthCallback = ({ onNavigate }: AuthCallbackProps) => {
  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Check if we have stored form data from OAuth signup
        const storedData = sessionStorage.getItem('signupFormData');

        if (storedData) {
          const formData = JSON.parse(storedData);

          // Create profile with stored data
          await api.auth.createProfile({
            id: session.user.id,
            email: session.user.email!,
            firstName: formData.firstName || null,
            lastName: formData.lastName || null,
            phone: formData.phone || null,
            creditHistoryAge: formData.creditHistoryAge || null,
            creditScore: formData.creditScore ? parseInt(formData.creditScore) : null,
            knowsCreditScore: formData.knowsCreditScore === 'yes',
            travelGoal: formData.travelGoal || null,
            diningGoal: formData.diningGoal || null,
            buildCreditGoal: formData.buildCreditGoal || null,
            cashbackGoal: formData.cashbackGoal || null,
            onlineShoppingGoal: formData.onlineShoppingGoal || null,
          });

          // Clear stored data
          sessionStorage.removeItem('signupFormData');
        }

        onNavigate('dashboard');
      } else {
        onNavigate('signin');
      }
    };

    handleCallback();
  }, [onNavigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
};

export default AuthCallback;
