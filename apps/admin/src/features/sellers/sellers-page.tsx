import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, PenIcon, Plus, Search, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '../../components/data-table/data-table';
import { PageHeader } from '../../components/shared/page-header';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { formatDateShort } from '../../lib/utils';
import { sellersService } from '../../services';
import type { SellerProfile } from '../../types';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function SellersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error } = useQuery({
    queryKey: ['sellers', { status: statusFilter, page, search: debouncedSearch }],
    queryFn: () =>
      sellersService.getSellers({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit: 20,
        search: debouncedSearch || undefined,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    }) => sellersService.update(id, { verificationStatus: status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellers'] }),
  });

  const allStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const;

  function statusBadgeClass(status: string) {
    return status === 'APPROVED'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'REJECTED'
        ? 'bg-gray-900 text-gray-50'
        : status === 'SUSPENDED'
          ? 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-800';
  }

  const getStatusOptions = (current: string) =>
    allStatuses
      .filter((s) => s !== current)
      .map((value) => ({
        value,
        className: statusBadgeClass(value),
      }));

  const sellers = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Stores" description="Manage seller stores and accounts">
        <Button onClick={() => navigate('/stores/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Store
        </Button>
      </PageHeader>

      <Card>
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by store name, city or state..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            onRowClick={(s: SellerProfile) => navigate(`/stores/${s.id}`)}
            columns={[
              {
                key: 'store',
                header: 'Store',
                render: (s: SellerProfile) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <Store className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.storeName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.city}
                        {s.state ? `, ${s.state}` : ''}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'commissionRate',
                header: 'Commission',
                render: (s: SellerProfile) => (
                  <span className="text-sm">{(s.commissionRate * 100).toFixed(0)}%</span>
                ),
              },
              {
                key: 'preparationTime',
                header: 'Prep Time',
                render: (s: SellerProfile) => (
                  <span className="text-sm">{s.preparationTime} min</span>
                ),
              },
              {
                key: 'createdAt',
                header: 'Created',
                render: (s: SellerProfile) => (
                  <span className="text-sm whitespace-nowrap">{formatDateShort(s.createdAt)}</span>
                ),
              },
              {
                key: 'verificationStatus',
                header: 'Status',
                render: (s: SellerProfile) => (
                  <Badge className={statusBadgeClass(s.verificationStatus)}>
                    {s.verificationStatus}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                className: 'w-[140px]',
                render: (s: SellerProfile) => {
                  const options = getStatusOptions(s.verificationStatus);
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <PenIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/stores/${s.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Store
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {options.map((opt) => (
                          <DropdownMenuItem
                            key={opt.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              statusMutation.mutate({ id: s.id, status: opt.value });
                            }}
                            disabled={statusMutation.isPending}
                          >
                            <span className={opt.className}>{opt.value}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                },
              },
            ]}
            data={sellers}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No stores found matching your criteria."
            meta={data?.meta}
            onPageChange={setPage}
            keyExtractor={(s: SellerProfile) => s.id}
          />
        </div>
      </Card>
    </div>
  );
}
