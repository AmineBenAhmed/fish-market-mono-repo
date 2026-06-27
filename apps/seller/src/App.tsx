import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthGuard } from './components/guards/auth-guard';
import { Shell } from './components/layout/shell';
import { HomePage } from './features/home/home-page';
import { ListingDetailPage } from './features/listings/listing-detail-page';
import { ListingsPage } from './features/listings/listings-page';
import { OrdersPage } from './features/orders/orders-page';
import { EarningsPage } from './features/earnings/earnings-page';
import { SettingsPage } from './features/settings/settings-page';
import { StorePage } from './features/store/store-page';
import { NotificationsPage } from './features/notifications/notifications-page';
import { LoginPage } from './features/auth/login-page';
import { RegisterPage } from './features/auth/register-page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <AuthGuard>
              <Shell />
            </AuthGuard>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="listings/:id" element={<ListingDetailPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export { App };
