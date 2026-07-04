import { Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable } from '../../components/data-table/data-table';
import { PageHeader } from '../../components/shared/page-header';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { formatCurrency, formatDate, statusColor } from '../../lib/utils';
import { driversService, ordersService } from '../../services';
import type { DriverProfile, Order } from '../../types';

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

export function OrdersPage() {
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', { status, search, page }],
    queryFn: () =>
      ordersService.getOrders({
        status: status !== 'all' ? status : undefined,
        search: search || undefined,
        page,
      }),
  });

  const { data: driversData } = useQuery({
    queryKey: ['drivers', 'all'],
    queryFn: () => driversService.getDrivers({ limit: 100 }),
  });

  const drivers = driversData?.data ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      ordersService.updateStatus(id, status, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Invalid status transition';
      toast.error(message);
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: ({ orderId, driverId }: { orderId: string; driverId: string }) =>
      ordersService.assignDriver(orderId, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Driver assigned');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to assign driver');
    },
  });

  const orders: Order[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="View and manage all marketplace orders" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Orders</CardTitle>
          <div className="flex gap-4 pt-2">
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-xs"
            />
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: 'orderNumber',
                header: 'Order',
                render: (o: Order) => <span className="font-medium">{o.orderNumber}</span>,
              },
              {
                key: 'customer',
                header: 'Customer',
                render: (o: Order) => (
                  <div>
                    <div className="font-medium">{o.customer?.name || o.customerId}</div>
                    {o.customer?.phone && (
                      <div className="text-xs text-muted-foreground">{o.customer.phone}</div>
                    )}
                  </div>
                ),
              },
              {
                key: 'store',
                header: 'Store',
                render: (o: Order) => (
                  <span className="text-sm">
                    {o.seller?.sellerProfiles?.[0]?.storeName || o.seller?.name || '-'}
                  </span>
                ),
              },
              {
                key: 'total',
                header: 'Total',
                render: (o: Order) => formatCurrency(Number(o.total)),
              },
              {
                key: 'status',
                header: 'Status',
                render: (o: Order) => (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={o.status}
                      onValueChange={(v) => statusMutation.mutate({ id: o.id, status: v })}
                    >
                      <SelectTrigger className="w-40 h-8">
                        <SelectValue>
                          <Badge className={statusColor(o.status)}>
                            {o.status.replace(/_/g, ' ')}
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
                ),
              },
              {
                key: 'driver',
                header: 'Driver',
                render: (o: Order) => (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={o.delivery?.driverId || ''}
                      onValueChange={(v) =>
                        assignDriverMutation.mutate({ orderId: o.id, driverId: v })
                      }
                    >
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue placeholder={o.delivery?.driver?.name || 'Assign...'} />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((d: DriverProfile) => (
                          <SelectItem key={d.id} value={d.userId}>
                            {d.user?.name || d.name || d.userId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ),
              },
              { key: 'items', header: 'Items', render: (o: Order) => o.items?.length ?? 0 },
              { key: 'createdAt', header: 'Date', render: (o: Order) => formatDate(o.createdAt) },
            ]}
            data={orders}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No orders found."
            meta={data?.meta}
            onPageChange={setPage}
            onRowClick={(o: Order) => navigate(`/orders/${o.id}`)}
            keyExtractor={(o: Order) => o.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
