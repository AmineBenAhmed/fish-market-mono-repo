import { useQueries } from '@tanstack/react-query';
import { CreditCard, ShoppingCart, Truck } from 'lucide-react';

import { StatCard } from '../../components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { dashboardService, deliveriesService, ordersService } from '../../services';

export function DashboardPage() {
  const results = useQueries({
    queries: [
      { queryKey: ['orders', 'today'], queryFn: () => dashboardService.getOrdersToday() },
      { queryKey: ['orders', 'pending'], queryFn: () => dashboardService.getPendingOrders() },
      { queryKey: ['drivers', 'count'], queryFn: () => dashboardService.getDrivers() },
      {
        queryKey: ['orders', 'list', { limit: 5 }],
        queryFn: () => ordersService.getOrders({ limit: 5 }),
      },
      {
        queryKey: ['deliveries', 'recent', { limit: 5 }],
        queryFn: () => deliveriesService.getDeliveries({ limit: 5 }),
      },
    ],
  });

  const [ordersToday, pendingOrders, driversCount, recentOrders, recentDeliveries] = results;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Marketplace overview and key metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Orders Today" value={ordersToday.data ?? '-'} icon={ShoppingCart} />
        <StatCard
          title="Pending Orders"
          value={pendingOrders.data ?? '-'}
          icon={ShoppingCart}
          description="Awaiting processing"
        />
        <StatCard title="Total Drivers" value={driversCount.data ?? '-'} icon={Truck} />
        <StatCard title="Revenue" value="-" icon={CreditCard} description="Coming soon" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(recentOrders.data?.data ?? []).slice(0, 5).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer?.name || 'Unknown'}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{order.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeliveries.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(recentDeliveries.data?.data ?? []).slice(0, 5).map((delivery: any) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{delivery.order?.orderNumber || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">
                        {delivery.driver?.name || 'Unassigned'}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{delivery.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
