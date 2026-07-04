import { Button } from '@fishmarket/ui';
import { useQuery } from '@tanstack/react-query';
import { Plus, Truck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['drivers', { status, page }],
    queryFn: () =>
      driversService.getDrivers({ status: status !== 'all' ? status : undefined, page }),
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
                key: 'status',
                header: 'Status',
                render: (d: DriverProfile) => (
                  <Badge className={statusColor(d.status)}>{d.status}</Badge>
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
            keyExtractor={(d: DriverProfile) => d.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
