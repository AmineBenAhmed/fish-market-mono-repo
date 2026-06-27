import { Button } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { useState } from 'react';

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
import { formatDate, statusColor } from '../../lib/utils';
import { deliveriesService } from '../../services';
import type { Delivery } from '../../types';

export function DeliveriesPage() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['deliveries', { status, page }],
    queryFn: () =>
      deliveriesService.getDeliveries({ status: status !== 'all' ? status : undefined, page }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      deliveriesService.cancelDelivery(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
  });

  const deliveries: Delivery[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Deliveries" description="Track and manage deliveries" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Deliveries</CardTitle>
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING_ASSIGNMENT">Pending Assignment</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: 'id',
                header: 'Delivery',
                render: (d: Delivery) => (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs">{d.id.slice(0, 8)}</span>
                  </div>
                ),
              },
              {
                key: 'order',
                header: 'Order',
                render: (d: Delivery) => d.order?.orderNumber || d.orderId.slice(0, 8),
              },
              {
                key: 'driver',
                header: 'Driver',
                render: (d: Delivery) => d.driver?.name || 'Unassigned',
              },
              {
                key: 'status',
                header: 'Status',
                render: (d: Delivery) => (
                  <Badge className={statusColor(d.status)}>{d.status.replace(/_/g, ' ')}</Badge>
                ),
              },
              {
                key: 'createdAt',
                header: 'Created',
                render: (d: Delivery) => formatDate(d.createdAt),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (d: Delivery) => (
                  <div className="flex gap-2">
                    {!['DELIVERED', 'CANCELLED', 'FAILED'].includes(d.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Cancel this delivery?')) {
                            cancelMutation.mutate({ id: d.id, reason: '' });
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
            data={deliveries}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No deliveries found."
            meta={data?.meta}
            onPageChange={setPage}
            keyExtractor={(d: Delivery) => d.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
