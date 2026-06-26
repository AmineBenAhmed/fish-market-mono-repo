import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth';
import { LoadingScreen } from '../components/LoadingScreen';
import { AuthNavigator } from './auth-navigator';
import { DriverTabNavigator } from './driver-tab-navigator';

export function RootNavigator() {
  const { isLoading, isAuthenticated, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated()) {
    return <AuthNavigator />;
  }

  return <DriverTabNavigator />;
}
