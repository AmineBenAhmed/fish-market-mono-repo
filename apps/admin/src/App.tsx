import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthGuard } from './components/guards/auth-guard';
import { DashboardShell } from './components/layout/shell';
import { AnalyticsPage } from './features/analytics/analytics-page';
import { CategoriesPage } from './features/categories/categories-page';
import { DashboardPage } from './features/dashboard/dashboard-page';
import { LoginPage } from './features/auth/login-page';
import { DeliveriesPage } from './features/deliveries/deliveries-page';
import { DriverCreatePage } from './features/drivers/driver-create-page';
import { DriverDetailPage } from './features/drivers/driver-detail-page';
import { DriversPage } from './features/drivers/drivers-page';
import { NotificationsPage } from './features/notifications/notifications-page';
import { OrderDetailPage } from './features/orders/order-detail-page';
import { OrdersPage } from './features/orders/orders-page';
import { PaymentsPage } from './features/payments/payments-page';
import { SellersPage } from './features/sellers/sellers-page';
import { StoreCreatePage } from './features/stores/store-create-page';
import { StoreDetailPage } from './features/stores/store-detail-page';
import { ListingCreatePage } from './features/listings/listing-create-page';
import { ListingDetailPage } from './features/listings/listing-detail-page';
import { ListingsPage } from './features/listings/listings-page';
import { UserCreatePage } from './features/users/user-create-page';
import { UsersPage } from './features/users/users-page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <AuthGuard>
              <DashboardShell />
            </AuthGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/new" element={<UserCreatePage />} />
          <Route path="stores" element={<SellersPage />} />
          <Route path="stores/new" element={<StoreCreatePage />} />
          <Route path="stores/:id" element={<StoreDetailPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="drivers/new" element={<DriverCreatePage />} />
          <Route path="drivers/:id" element={<DriverDetailPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="listings/new" element={<ListingCreatePage />} />
          <Route path="listings/:id" element={<ListingDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export { App };
