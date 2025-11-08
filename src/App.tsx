import { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import SignUpFlow from './components/SignUpFlow';
import Dashboard from './components/Dashboard';
import CreditRoute from './components/CreditRoute';
import Explore from './components/Explore';

type Screen = 'loading' | 'signin' | 'signup' | 'signup-flow' | 'dashboard' | 'credit-route' | 'explore';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('loading');

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setCurrentScreen('signin');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

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
