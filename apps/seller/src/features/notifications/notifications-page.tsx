import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@fishmarket/ui';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatRelativeTime } from '../../lib/utils';
import { notificationsService } from '../../services';

export function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['seller', 'notifications'],
    queryFn: () => notificationsService.getNotifications({ limit: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'notifications'] }),
  });

  const notifications = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-accent">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold">Notifications</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}>
          <CheckCheck className="h-4 w-4 mr-1" />
          Mark All Read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`cursor-pointer active:bg-accent transition-colors ${!n.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
              onClick={() => {
                if (!n.isRead) markReadMutation.mutate(n.id);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                      <p className={`text-sm ${!n.isRead ? 'font-semibold' : ''} truncate`}>
                        {n.title}
                      </p>
                    </div>
                    {n.body && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {n.type.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
