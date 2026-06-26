import { Button } from '@fishmarket/ui';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency, formatDate, statusColor } from '../../lib/utils';
import { ordersService } from '../../services';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.getOrder(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{order.orderNumber}</h2>
          <p className="text-muted-foreground">Order details</p>
        </div>
        <Badge className={statusColor(order.status)}>{order.status.replace(/_/g, ' ')}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Customer</span>
              <span className="text-sm font-medium">
                {order.customer?.name || order.customerId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm">{order.customer?.email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-medium">{formatCurrency(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Delivery Fee</span>
              <span className="text-sm font-medium">
                {formatCurrency(Number(order.deliveryFee))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Commission</span>
              <span className="text-sm font-medium">
                {formatCurrency(Number(order.commission))}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-sm font-bold">{formatCurrency(Number(order.total))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{formatDate(order.createdAt)}</span>
            </div>
            {order.cancelReason && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cancel Reason</span>
                <span className="text-sm text-red-600">{order.cancelReason}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(order.items ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No items</p>
              ) : (
                (order.items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variantName} × {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(Number(item.totalPrice))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(Number(item.unitPrice))}/{item.unit}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.statusHistory.map((h) => (
                <div key={h.id} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {h.fromStatus && (
                        <>
                          <Badge variant="secondary">{h.fromStatus}</Badge>
                          <span className="text-muted-foreground">→</span>
                        </>
                      )}
                      <Badge>{h.toStatus}</Badge>
                    </div>
                    {h.reason && <p className="mt-1 text-xs text-muted-foreground">{h.reason}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(h.createdAt)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
