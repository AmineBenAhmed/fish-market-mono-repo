import { Button } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency, formatDate, statusColor } from '../../lib/utils';
import { driversService, ordersService } from '../../services';

const orderStatuses = [
  'DRAFT',
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.getOrder(id!),
    enabled: !!id,
  });

  const { data: driversData } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversService.getDrivers({ limit: 100 }),
  });

  const drivers = driversData?.data ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason?: string }) =>
      ordersService.updateStatus(id!, status, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', id] }),
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Invalid status transition';
      toast.error(message);
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: (driverId: string) => ordersService.assignDriver(id!, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast.success('Driver assigned successfully');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to assign driver';
      toast.error(message);
    },
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

  const storeProfile = order.seller?.sellerProfiles?.[0];
  const deliveryAddress = order.delivery?.address;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Created {formatDate(order.createdAt)}</p>
        </div>
        <Select value={order.status} onValueChange={(v) => statusMutation.mutate({ status: v })}>
          <SelectTrigger className="w-44">
            <SelectValue>
              <Badge variant="outline" className={statusColor(order.status)}>
                {order.status.replace(/_/g, ' ')}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {orderStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Name</span>
              <p className="font-medium">{order.customer?.name || order.customerId}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Phone</span>
              <p className="font-medium">{order.customer?.phone || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email</span>
              <p className="text-sm">{order.customer?.email || '-'}</p>
            </div>
            {deliveryAddress && (
              <div>
                <span className="text-sm text-muted-foreground">Delivery Address</span>
                <p className="text-sm">
                  {[
                    (deliveryAddress as any).street,
                    (deliveryAddress as any).number,
                    (deliveryAddress as any).complement,
                    (deliveryAddress as any).neighborhood,
                    (deliveryAddress as any).city,
                    (deliveryAddress as any).state,
                  ]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Store Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Store</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Name</span>
              <p className="font-medium">{storeProfile?.storeName || order.seller?.name || '-'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Phone</span>
              <p className="font-medium">{order.seller?.phone || '-'}</p>
            </div>
            {storeProfile?.city && (
              <div>
                <span className="text-sm text-muted-foreground">Location</span>
                <p className="text-sm">
                  {[storeProfile.city, storeProfile.state].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
            )}
            {storeProfile?.pickupAddress && (
              <div>
                <span className="text-sm text-muted-foreground">Pickup Address</span>
                <p className="text-sm">{storeProfile.pickupAddress}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
            {Number(order.discount) > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Discount</span>
                <span className="text-sm font-medium text-green-600">
                  -{formatCurrency(Number(order.discount))}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-sm font-bold">{formatCurrency(Number(order.total))}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-sm text-muted-foreground">Items</span>
              <span className="text-sm">{order.items?.length ?? 0}</span>
            </div>
            {order.cancelReason && (
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Cancel Reason</span>
                <span className="text-sm text-red-600">{order.cancelReason}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Driver */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Driver
          </CardTitle>
        </CardHeader>
        <CardContent>
          {order.delivery?.driver ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{order.delivery.driver.name}</p>
                  {order.delivery.driver.phone && (
                    <p className="text-sm text-muted-foreground">{order.delivery.driver.phone}</p>
                  )}
                </div>
                <Badge variant="secondary">Assigned</Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-3">No driver assigned</p>
          )}
          <div className="mt-3">
            <Select
              value=""
              onValueChange={(v) => assignDriverMutation.mutate(v)}
              disabled={assignDriverMutation.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Assign a driver..." />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.userId}>
                    {d.user?.name || d.name || d.userId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          {(order.items ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No items</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Variant</th>
                    <th className="pb-3 font-medium text-center">Qty</th>
                    <th className="pb-3 font-medium text-right">Unit Price</th>
                    <th className="pb-3 font-medium text-center">Cleaning</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items ?? []).map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{item.productName}</td>
                      <td className="py-3 text-muted-foreground">
                        {item.variantName} ({item.unit})
                      </td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(Number(item.unitPrice))}
                      </td>
                      <td className="py-3 text-center">
                        {item.cleaning ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <XCircle className="h-3.5 w-3.5" />
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {formatCurrency(Number(item.totalPrice))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status History */}
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
                          <Badge variant="outline" className={statusColor(h.fromStatus)}>
                            {h.fromStatus}
                          </Badge>
                          <span className="text-muted-foreground">&rarr;</span>
                        </>
                      )}
                      <Badge variant="outline" className={statusColor(h.toStatus)}>
                        {h.toStatus}
                      </Badge>
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
