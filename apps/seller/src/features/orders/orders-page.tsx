import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@fishmarket/ui';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency, formatTime, statusColor } from '../../lib/utils';
import { ordersService } from '../../services';
import type { Order } from '../../types';

const statusTabs = ['all', 'PENDING', 'CONFIRMED', 'READY_FOR_PICKUP', 'DELIVERED'];

export function OrdersPage() {
  const [tab, setTab] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['seller', 'orders'],
    queryFn: () => ordersService.getOrders({ limit: 50 }),
  });

  const markReadyMutation = useMutation({
    mutationFn: (id: string) => ordersService.markReady(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'orders'] }),
  });

  const orders = (data?.data ?? []).filter((o) => tab === 'all' || o.status === tab);

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <h2 className="text-xl font-bold">Orders</h2>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {statusTabs.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === s ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
            }`}
          >
            {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No orders in this status</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{order.orderNumber}</span>
                        <Badge className={statusColor(order.status)}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {order.customer?.name || 'Customer'} · {formatTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{formatCurrency(Number(order.total))}</span>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === order.id ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>
                </button>

                {expandedId === order.id && (
                  <div className="mt-3 space-y-3 border-t pt-3">
                    {(order.items ?? []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>
                          {item.productName} × {item.quantity} {item.unit}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(Number(item.totalPrice))}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between border-t pt-2 text-sm font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(Number(order.total))}</span>
                    </div>

                    {order.status === 'CONFIRMED' && (
                      <Button
                        className="w-full h-12 text-base"
                        onClick={() => markReadyMutation.mutate(order.id)}
                        disabled={markReadyMutation.isPending}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Mark Ready for Pickup
                      </Button>
                    )}

                    {order.status === 'READY_FOR_PICKUP' && (
                      <div className="rounded-lg bg-purple-50 p-3 text-center text-sm text-purple-700 font-medium">
                        Ready for pickup — waiting for driver
                      </div>
                    )}

                    {order.status === 'DELIVERED' && (
                      <div className="rounded-lg bg-emerald-50 p-3 text-center text-sm text-emerald-700 font-medium">
                        Delivered
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
