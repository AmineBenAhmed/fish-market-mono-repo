import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Store, User, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Input } from '@fishmarket/ui';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { sellerService } from '../../services';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['seller', 'profile'],
    queryFn: sellerService.getProfile,
  });

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (profile) {
      setStoreName(profile.storeName || '');
      setDescription(profile.storeDescription || '');
      setCity(profile.city || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: () =>
      sellerService.updateProfile({ storeName, storeDescription: description, city } as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'profile'] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <h2 className="text-xl font-bold">Store Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4" />
            Store Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium">Store Name</label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">City</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>

            {updateMutation.isSuccess && (
              <p className="text-center text-sm text-emerald-600 font-medium">Profile updated!</p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Account Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Delivery Zone</p>
              <p className="font-medium">
                {profile?.deliveryZoneId ? `Zone ${profile.deliveryZoneId.slice(0, 8)}` : 'Not set'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Commission Rate</p>
              <p className="font-medium">
                {(Number(profile?.commissionRate ?? 0) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
