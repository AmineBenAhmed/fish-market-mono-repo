import { StatusBar } from 'expo-status-bar';
import { LocaleProvider } from '@/i18n/context';
import { CartProvider } from '@/stores/cart';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <LocaleProvider>
      <CartProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </CartProvider>
    </LocaleProvider>
  );
}
