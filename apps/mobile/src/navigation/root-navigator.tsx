import { useEffect, useReducer } from 'react';
import { useAuthStore } from '../stores/auth';
import { LoadingScreen } from '../components/LoadingScreen';
import { AuthNavigator } from './auth-navigator';
import { DriverTabNavigator } from './driver-tab-navigator';

export function RootNavigator() {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const unsub = useAuthStore.subscribe(() => {
      forceUpdate();
    });
    useAuthStore.getState().restoreSession();
    return unsub;
  }, []);

  const { isLoading, token } = useAuthStore.getState();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!token) {
    return <AuthNavigator />;
  }

  return <DriverTabNavigator />;
}
