import { useQuery } from '@tanstack/react-query';
import { ClipboardList, DollarSign, ShoppingCart, TrendingUp, Clock, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency } from '../../lib/utils';
import { listingsService, ordersService, walletService } from '../../services';

export function HomePage() {
  const navigate = useNavigate();

  const { data: listingsResult, isLoading: listingsLoading } = useQuery({
    queryKey: ['seller', 'listings', 'today-home'],
    queryFn: () => listingsService.getToday({ limit: 50 }),
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['seller', 'orders', { limit: 5 }],
    queryFn: () => ordersService.getOrders({ limit: 5 }),
  });

  const { data: wallet } = useQuery({
    queryKey: ['seller', 'wallet'],
    queryFn: walletService.getWallet,
  });

  const listings = listingsResult?.data ?? [];

  const activeListings = listings.filter((l) => l.status === 'ACTIVE') ?? [];
  const pendingOrders =
    ordersData?.data?.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED') ?? [];
  const readyOrders = ordersData?.data?.filter((o) => o.status === 'READY_FOR_PICKUP') ?? [];
  const orders = ordersData?.data ?? [];

  const totalRemaining = listings.reduce((sum, l) => sum + l.quantity, 0) ?? 0;
  const todayEarnings = orders
    .filter((o) => o.status === 'DELIVERED' || o.status === 'READY_FOR_PICKUP')
    .reduce((sum, o) => sum + Number(o.total), 0);

  if (listingsLoading || ordersLoading) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/listings')}
          className="flex flex-col items-center justify-center rounded-xl bg-blue-50 p-4 text-blue-700 active:scale-95 transition-transform"
        >
          <ClipboardList className="h-8 w-8 mb-1" />
          <span className="text-2xl font-bold">{activeListings.length}</span>
          <span className="text-xs">Active Listings</span>
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="flex flex-col items-center justify-center rounded-xl bg-amber-50 p-4 text-amber-700 active:scale-95 transition-transform"
        >
          <ShoppingCart className="h-8 w-8 mb-1" />
          <span className="text-2xl font-bold">{pendingOrders.length}</span>
          <span className="text-xs">Pending Orders</span>
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="flex flex-col items-center justify-center rounded-xl bg-purple-50 p-4 text-purple-700 active:scale-95 transition-transform"
        >
          <Package className="h-8 w-8 mb-1" />
          <span className="text-2xl font-bold">{readyOrders.length}</span>
          <span className="text-xs">Ready Pickup</span>
        </button>
        <button
          onClick={() => navigate('/earnings')}
          className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 p-4 text-emerald-700 active:scale-95 transition-transform"
        >
          <TrendingUp className="h-8 w-8 mb-1" />
          <span className="text-2xl font-bold">{formatCurrency(todayEarnings)}</span>
          <span className="text-xs">Today</span>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Today's Fish
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!listings || listings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No listings for today</p>
              <button
                onClick={() => navigate('/listings')}
                className="mt-3 text-sm font-medium text-blue-600"
              >
                Add your first fish →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.slice(0, 4).map((listing) => (
                <div key={listing.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {listing.product?.name ?? listing.title ?? 'Fish'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {listing.variant?.name ?? ''} · {listing.quantity}{' '}
                      {listing.unit || listing.variant?.unit || ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(Number(listing.price))}</p>
                    <p className="text-xs text-muted-foreground">
                      /{listing.unit || listing.variant?.unit || ''}
                    </p>
                  </div>
                </div>
              ))}
              {(listings?.length ?? 0) > 4 && (
                <button
                  onClick={() => navigate('/listings')}
                  className="w-full text-center text-sm text-blue-600 pt-2"
                >
                  View all {listings.length} listings →
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" />
            Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <span className="text-2xl font-bold">
              {formatCurrency(Number(wallet?.balance ?? 0))}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
