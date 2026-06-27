import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Check, MoreHorizontal, User, X } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '../../components/data-table/data-table';
import { PageHeader } from '../../components/shared/page-header';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { formatDate, statusColor } from '../../lib/utils';
import { usersService } from '../../services';
import type { User as UserType } from '../../types';

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', { search, roleFilter, page }],
    queryFn: () =>
      usersService.getUsers({
        search: search || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        page,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      usersService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const users: UserType[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage marketplace users" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Users</CardTitle>
          </div>
          <div className="flex gap-4 pt-2">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="max-w-xs"
            />
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="SELLER">Seller</SelectItem>
                <SelectItem value="DRIVER">Driver</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: 'name',
                header: 'User',
                render: (u: UserType) => (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{u.name}</span>
                  </div>
                ),
              },
              {
                key: 'email',
                header: 'Email',
                render: (u: UserType) => <span className="text-muted-foreground">{u.email}</span>,
              },
              {
                key: 'role',
                header: 'Role',
                render: (u: UserType) => <Badge>{u.role}</Badge>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (u: UserType) => (
                  <Badge className={statusColor(u.status)}>{u.status}</Badge>
                ),
              },
              {
                key: 'phone',
                header: 'Phone',
                render: (u: UserType) => u.phone || '-',
              },
              {
                key: 'createdAt',
                header: 'Joined',
                render: (u: UserType) => formatDate(u.createdAt),
              },
              {
                key: 'actions',
                header: '',
                className: 'w-[50px]',
                render: (u: UserType) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Actions</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {u.status !== 'ACTIVE' && (
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatusMutation.mutate({ id: u.id, status: 'ACTIVE' })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <Check className="mr-2 h-4 w-4 text-emerald-600" />
                          Set Active
                        </DropdownMenuItem>
                      )}
                      {u.status !== 'INACTIVE' && (
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatusMutation.mutate({ id: u.id, status: 'INACTIVE' })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="mr-2 h-4 w-4 text-amber-600" />
                          Set Inactive
                        </DropdownMenuItem>
                      )}
                      {u.status !== 'SUSPENDED' && (
                        <DropdownMenuItem
                          onClick={() =>
                            updateStatusMutation.mutate({ id: u.id, status: 'SUSPENDED' })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <Ban className="mr-2 h-4 w-4 text-red-600" />
                          Suspend
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
            data={users}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No users found."
            meta={data?.meta}
            onPageChange={setPage}
            keyExtractor={(u: UserType) => u.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
