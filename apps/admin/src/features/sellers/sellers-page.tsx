import { Button } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Store, X } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '../../components/data-table/data-table';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { formatDate } from '../../lib/utils';
import { sellersService } from '../../services';
import type { SellerProfile } from '../../types';

const statusBadge: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export function SellersPage() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['sellers', { status, page }],
    queryFn: () =>
      sellersService.getSellers({ status: status !== 'all' ? status : undefined, page }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => sellersService.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellers'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => sellersService.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellers'] }),
  });

  const sellers: SellerProfile[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sellers</h2>
        <p className="text-muted-foreground">Manage seller accounts and approvals</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Sellers</CardTitle>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: 'storeName',
                header: 'Store',
                render: (s: SellerProfile) => (
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{s.storeName}</span>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (s: SellerProfile) => (
                  <Badge className={statusBadge[s.status]}>{s.status}</Badge>
                ),
              },
              { key: 'city', header: 'Location', render: (s: SellerProfile) => s.city || '-' },
              {
                key: 'rating',
                header: 'Rating',
                render: (s: SellerProfile) => (s.rating ? `${s.rating.toFixed(1)} ⭐` : '-'),
              },
              {
                key: 'totalOrders',
                header: 'Orders',
                render: (s: SellerProfile) => s.totalOrders || 0,
              },
              {
                key: 'createdAt',
                header: 'Joined',
                render: (s: SellerProfile) => formatDate(s.createdAt),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (s: SellerProfile) => (
                  <div className="flex gap-2">
                    {s.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            approveMutation.mutate(s.id);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            rejectMutation.mutate(s.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
            data={sellers}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No sellers found."
            meta={data?.meta}
            onPageChange={setPage}
            keyExtractor={(s: SellerProfile) => s.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
