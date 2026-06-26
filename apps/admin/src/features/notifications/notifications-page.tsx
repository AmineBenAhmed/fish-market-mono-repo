import { Button } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
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
import { formatRelativeTime } from '../../lib/utils';
import { notificationsService } from '../../services';
import type { Notification } from '../../types';

export function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState('false');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', { unreadOnly, page }],
    queryFn: () =>
      notificationsService.getNotifications({
        unreadOnly: unreadOnly === 'true' ? 'true' : undefined,
        page,
      }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsService.deleteNotification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: Notification[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">View and manage system notifications</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Notifications</CardTitle>
            <div className="flex gap-2">
              <Select
                value={unreadOnly}
                onValueChange={(v) => {
                  setUnreadOnly(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">All</SelectItem>
                  <SelectItem value="true">Unread Only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: 'title',
                header: 'Title',
                render: (n: Notification) => (
                  <div className="flex items-center gap-2">
                    <Bell
                      className={`h-4 w-4 ${n.isRead ? 'text-muted-foreground' : 'text-primary'}`}
                    />
                    <span className={n.isRead ? '' : 'font-semibold'}>{n.title}</span>
                  </div>
                ),
              },
              {
                key: 'type',
                header: 'Type',
                render: (n: Notification) => (
                  <Badge variant="secondary">{n.type.replace(/_/g, ' ')}</Badge>
                ),
              },
              {
                key: 'body',
                header: 'Message',
                render: (n: Notification) => (
                  <span className="text-sm text-muted-foreground truncate max-w-[200px] inline-block">
                    {n.body || '-'}
                  </span>
                ),
              },
              {
                key: 'isRead',
                header: 'Status',
                render: (n: Notification) =>
                  n.isRead ? (
                    <span className="text-sm text-muted-foreground">Read</span>
                  ) : (
                    <Badge>New</Badge>
                  ),
              },
              {
                key: 'createdAt',
                header: 'Time',
                render: (n: Notification) => (
                  <span className="text-sm text-muted-foreground">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (n: Notification) => (
                  <div className="flex gap-2">
                    {!n.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          markReadMutation.mutate(n.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(n.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={notifications}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No notifications found."
            meta={data?.meta}
            onPageChange={setPage}
            keyExtractor={(n: Notification) => n.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
