import { Button } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Truck } from 'lucide-react';
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
import { formatDate, statusColor } from '../../lib/utils';
import { driversService } from '../../services';
import type { DriverProfile } from '../../types';

export function DriversPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['drivers', { status, page }],
    queryFn: () =>
      driversService.getDrivers({ status: status !== 'all' ? status : undefined, page }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ONLINE' | 'OFFLINE' }) =>
      driversService.updateDriverStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver status updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    },
  });

  const drivers: DriverProfile[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Drivers" description="Manage delivery drivers">
        <Button onClick={() => navigate('/drivers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Driver
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Drivers</CardTitle>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
                <SelectItem value="OFFLINE">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: 'name',
                header: 'Driver',
                render: (d: DriverProfile) => (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{d.name || d.user?.name || d.id}</span>
                  </div>
                ),
              },
              {
                key: 'phone',
                header: 'Phone',
                render: (d: DriverProfile) => d.user?.phone || d.phone || '-',
              },
              {
                key: 'status',
                header: 'Status',
                render: (d: DriverProfile) => (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={d.status}
                      onValueChange={(v) =>
                        statusMutation.mutate({ id: d.id, status: v as 'ONLINE' | 'OFFLINE' })
                      }
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue>
                          <Badge className={statusColor(d.status)}>{d.status}</Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ONLINE">Online</SelectItem>
                        <SelectItem value="OFFLINE">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ),
              },
              {
                key: 'isAvailable',
                header: 'Available',
                render: (d: DriverProfile) => (d.isAvailable ? 'Yes' : 'No'),
              },
              {
                key: 'activeDeliveries',
                header: 'Active',
                render: (d: DriverProfile) => `${d.activeDeliveries}/${d.maxDeliveries}`,
              },
              {
                key: 'vehicleType',
                header: 'Vehicle',
                render: (d: DriverProfile) => d.vehicleType || '-',
              },
              {
                key: 'deliveryFee',
                header: 'Delivery Fee',
                render: (d: DriverProfile) => (d.deliveryFee ? `${d.deliveryFee} TND` : '-'),
              },
              { key: 'city', header: 'City', render: (d: DriverProfile) => d.city || '-' },
              {
                key: 'createdAt',
                header: 'Joined',
                render: (d: DriverProfile) => formatDate(d.createdAt),
              },
            ]}
            data={drivers}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No drivers found."
            meta={data?.meta}
            onPageChange={setPage}
            onRowClick={(d: DriverProfile) => navigate(`/drivers/${d.id}`)}
            keyExtractor={(d: DriverProfile) => d.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
