import { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import SignUpFlow from './components/SignUpFlow';
import Dashboard from './components/Dashboard';
import CreditRoute from './components/CreditRoute';
import Explore from './components/Explore';
import { ConnectedBanks } from './components/ConnectedBanks';
import { Button } from './components/ui/button';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type Screen = 'loading' | 'signin' | 'signup' | 'signup-flow' | 'dashboard' | 'credit-route' | 'explore' | 'connected-banks';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('loading');
  const { user, loading: authLoading, isNewUser } = useAuth();

  useEffect(() => {
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
      case 'connected-banks':
        return (
          <div className="min-h-screen bg-[#4962bf] p-6">
            <div className="max-w-6xl mx-auto">
              <Button
                onClick={() => setCurrentScreen('dashboard')}
                variant="outline"
                className="mb-4 bg-white/20 border-white/40 text-white hover:bg-white/30"
              >
                ← Back to Dashboard
              </Button>
              <ConnectedBanks />
            </div>
          </div>
        );
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
