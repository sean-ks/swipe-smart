import { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import SignUpFlow from './components/SignUpFlow';
import Dashboard from './components/Dashboard';
import CreditRoute from './components/CreditRoute';
import Explore from './components/Explore';
import AuthCallback from './components/AuthCallback';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type Screen = 'loading' | 'signin' | 'signup' | 'signup-flow' | 'dashboard' | 'credit-route' | 'explore' | 'auth-callback';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('loading');
  const { user, loading: authLoading, isNewUser } = useAuth();

  useEffect(() => {
    // Check for auth callback first
    if (window.location.pathname === '/auth-callback') {
      setCurrentScreen('auth-callback');
      return;
    }

    // Wait for auth to load, then check if user is authenticated
    if (!authLoading) {
      if (user) {
        // If user just signed in and is new, route to signup flow
        if (isNewUser) {
          setCurrentScreen('signup-flow');
        } else {
          setCurrentScreen('dashboard');
        }
      } else {
        setCurrentScreen('signin');
      }
    }
  }, [user, authLoading, isNewUser]);

  // Show loading screen while checking auth
  if (authLoading || currentScreen === 'loading') {
    return <LoadingScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return <LoadingScreen />;
      case 'signin':
        return <SignIn onNavigate={setCurrentScreen} />;
      case 'signup':
        return <SignUp onNavigate={setCurrentScreen} />;
      case 'signup-flow':
        return <SignUpFlow onNavigate={setCurrentScreen} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentScreen} />;
      case 'credit-route':
        return <CreditRoute onNavigate={setCurrentScreen} />;
      case 'explore':
        return <Explore onNavigate={setCurrentScreen} />;
      case 'auth-callback':
        return <AuthCallback onNavigate={setCurrentScreen} />;
      default:
        return <SignIn onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#4962bf]">
      {renderScreen()}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
