import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency, formatDate } from '../../lib/utils';
import { ordersService, walletService } from '../../services';

export function EarningsPage() {
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['seller', 'wallet'],
    queryFn: walletService.getWallet,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['seller', 'transactions', { limit: 20 }],
    queryFn: () => walletService.getTransactions({ limit: 20 }),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['seller', 'orders', { limit: 100 }],
    queryFn: () => ordersService.getOrders({ limit: 100 }),
  });

  const deliveredOrders = ordersData?.data?.filter((o) => o.status === 'DELIVERED') ?? [];
  const todayStr = new Date().toDateString();
  const todayEarnings = deliveredOrders
    .filter((o) => new Date(o.createdAt).toDateString() === todayStr)
    .reduce((sum, o) => sum + Number(o.total), 0);

  const transactions = txData?.data ?? [];
  const totalCommission = deliveredOrders.reduce((sum, o) => sum + Number(o.commission), 0);

  if (walletLoading || txLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <h2 className="text-xl font-bold">Earnings</h2>

      <Card className="bg-gradient-to-br from-emerald-50 to-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(Number(wallet?.balance ?? 0))}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <DollarSign className="h-7 w-7 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              <span>Today: {formatCurrency(todayEarnings)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Commission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Sales (Delivered)</span>
              <span className="font-medium">
                {formatCurrency(deliveredOrders.reduce((s, o) => s + Number(o.total), 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Commission</span>
              <span className="font-medium text-amber-600">-{formatCurrency(totalCommission)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2 font-semibold">
              <span>Net Earnings</span>
              <span>
                {formatCurrency(
                  deliveredOrders.reduce((s, o) => s + Number(o.total), 0) - totalCommission,
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tx.type === 'SELLER_EARNING' ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {tx.description || tx.type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
