import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Check, Eye, MoreHorizontal, Plus, Search, Store, X } from 'lucide-react';
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
import { formatDateShort, statusColor } from '../../lib/utils';
import { sellersService, usersService } from '../../services';
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

  const approveMutation = useMutation({
    mutationFn: (id: string) => sellersService.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellers'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => sellersService.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellers'] }),
  });

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => usersService.updateStatus(userId, 'SUSPENDED'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellers'] }),
  });

  const activateMutation = useMutation({
    mutationFn: (userId: string) => usersService.updateStatus(userId, 'ACTIVE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellers'] }),
  });

  const sellers = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Stores" description="Manage seller stores and accounts">
        <Button onClick={() => navigate('/sellers/new')}>
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
                placeholder="Search by name, email, phone or address..."
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
              </SelectContent>
            </Select>
          </div>

          <DataTable
            onRowClick={(s: SellerProfile) => navigate(`/sellers/${s.id}`)}
            columns={[
              {
                key: 'name',
                header: 'Seller Name',
                render: (s: SellerProfile) => (
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <Store className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{s.user?.name || s.storeName}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.storeName}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'phone',
                header: 'Phone',
                render: (s: SellerProfile) => (
                  <span className="text-sm text-muted-foreground">{s.user?.phone || '-'}</span>
                ),
              },
              {
                key: 'createdAt',
                header: 'Join Date',
                render: (s: SellerProfile) => (
                  <span className="text-sm whitespace-nowrap">{formatDateShort(s.createdAt)}</span>
                ),
              },
              {
                key: 'orders',
                header: 'Orders (Month)',
                className: 'text-center',
                render: () => <span className="text-sm text-muted-foreground">-</span>,
              },
              {
                key: 'sales',
                header: 'Sales (Month)',
                className: 'text-center',
                render: () => <span className="text-sm text-muted-foreground">-</span>,
              },
              {
                key: 'verificationStatus',
                header: 'Status',
                render: (s: SellerProfile) => (
                  <Badge className={statusColor(s.verificationStatus)}>
                    {s.verificationStatus}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                header: '',
                className: 'w-[50px]',
                render: (s: SellerProfile) => {
                  const userId = s.user?.id;
                  const isSuspended = s.user?.status === 'SUSPENDED';

                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Actions</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/sellers/${s.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Store
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {s.verificationStatus === 'PENDING' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => approveMutation.mutate(s.id)}
                              disabled={approveMutation.isPending}
                            >
                              <Check className="mr-2 h-4 w-4 text-emerald-600" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => rejectMutation.mutate(s.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <X className="mr-2 h-4 w-4 text-red-600" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {s.verificationStatus === 'APPROVED' && userId && (
                          <DropdownMenuItem
                            onClick={() =>
                              isSuspended
                                ? activateMutation.mutate(userId)
                                : suspendMutation.mutate(userId)
                            }
                            disabled={suspendMutation.isPending || activateMutation.isPending}
                          >
                            {isSuspended ? (
                              <>
                                <Check className="mr-2 h-4 w-4 text-emerald-600" />
                                Reactivate
                              </>
                            ) : (
                              <>
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                },
              },
            ]}
            data={sellers}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No sellers found matching your criteria."
            meta={data?.meta}
            onPageChange={setPage}
            keyExtractor={(s: SellerProfile) => s.id}
          />
        </div>
      </Card>
    </div>
  );
}
