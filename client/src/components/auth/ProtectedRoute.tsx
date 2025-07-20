import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from './LoginScreen';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  component: React.ComponentType;
}

export default function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [, setLocation] = useLocation();

  const handleBackToKiosk = () => {
    setShowLogin(false);
    setLocation('/');
  };

  if (!isAuthenticated) {
    if (!showLogin) {
      // Automatically show login screen when accessing protected route
      setShowLogin(true);
    }
    return <LoginScreen onBack={handleBackToKiosk} />;
  }

  return <Component />;
}