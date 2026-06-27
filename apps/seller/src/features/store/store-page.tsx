import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Phone, Plus, Store, User } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate } from '../../lib/utils';
import { sellerService } from '../../services';

export function StorePage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['seller', 'profile'],
    queryFn: sellerService.getProfile,
    retry: false,
  });

  const noProfile = error && !profile;

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (noProfile && !showForm) {
    return (
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-bold">My Store</h2>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Store className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <p className="text-lg font-medium">You don't have a store yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your store to start selling on FishMarket
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (noProfile && showForm) {
    return <CreateStoreForm onBack={() => setShowForm(false)} />;
  }

  if (!profile) {
    return (
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-bold">My Store</h2>
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-destructive font-medium">Failed to load store</p>
            <p className="text-sm text-muted-foreground mt-1">
              {(error as Error)?.message || 'Store not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <h2 className="text-xl font-bold">My Store</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4" />
            Store Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Store Name</p>
            <p className="font-semibold text-lg">{profile.storeName}</p>
          </div>
          {profile.storeDescription && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-base">{profile.storeDescription}</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">
                {profile.city}
                {profile.state ? `, ${profile.state}` : ''}
              </p>
            </div>
          </div>
          {profile.pickupAddress && (
            <div>
              <p className="text-sm text-muted-foreground">Pickup Address</p>
              <p className="font-medium">{profile.pickupAddress}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.businessName && (
            <div>
              <p className="text-sm text-muted-foreground">Business Name</p>
              <p className="font-medium">{profile.businessName}</p>
            </div>
          )}
          {profile.taxId && (
            <div>
              <p className="text-sm text-muted-foreground">Tax ID</p>
              <p className="font-medium">{profile.taxId}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Commission Rate</p>
            <p className="font-medium">{(Number(profile.commissionRate) * 100).toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Delivery Radius</p>
            <p className="font-medium">{profile.deliveryRadius} km</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Preparation Time</p>
            <p className="font-medium">{profile.preparationTime} min</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Verification</span>
            <Badge
              className={
                profile.verificationStatus === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : profile.verificationStatus === 'REJECTED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
              }
            >
              {profile.verificationStatus === 'PENDING'
                ? 'Pending Approval'
                : profile.verificationStatus}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Store Active</span>
            <Badge
              className={
                profile.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
              }
            >
              {profile.isActive ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Member since</p>
            <p className="font-medium">{formatDate(profile.createdAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateStoreForm({ onBack }: { onBack: () => void }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    city: '',
    state: '',
    lat: '',
    lng: '',
    pickupAddress: '',
    businessName: '',
    businessDoc: '',
    taxId: '',
  });

  const applyMutation = useMutation({
    mutationFn: (data: Parameters<typeof sellerService.apply>[0]) => sellerService.apply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'profile'] });
    },
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeName || !form.city || !form.state) return;

    applyMutation.mutate({
      storeName: form.storeName,
      storeDescription: form.storeDescription || undefined,
      city: form.city,
      state: form.state,
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
      pickupAddress: form.pickupAddress || undefined,
      businessName: form.businessName || undefined,
      businessDoc: form.businessDoc || undefined,
      taxId: form.taxId || undefined,
    });
  };

  if (applyMutation.isSuccess) {
    return (
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-bold">My Store</h2>
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Store className="h-16 w-16 text-emerald-600 mx-auto" />
            <p className="text-lg font-medium text-emerald-700">Store Created!</p>
            <p className="text-sm text-muted-foreground">
              Your store is now pending approval. You'll be notified once it's approved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <h2 className="text-xl font-bold">Create Your Store</h2>
      <p className="text-sm text-muted-foreground">
        Fill in the details below to register your store. It will be reviewed by our team.
      </p>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Store Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Store Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="My Fish Store"
                value={form.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                placeholder="Tell customers about your store..."
                value={form.storeDescription}
                onChange={(e) => handleChange('storeDescription', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  City <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Tunis"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  State <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Tunis"
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Pickup Address</label>
              <Input
                placeholder="123 Fisherman St"
                value={form.pickupAddress}
                onChange={(e) => handleChange('pickupAddress', e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="36.8065"
                  value={form.lat}
                  onChange={(e) => handleChange('lat', e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="10.1815"
                  value={form.lng}
                  onChange={(e) => handleChange('lng', e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Business Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Business Name</label>
              <Input
                placeholder="Legal business name"
                value={form.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Business Doc</label>
              <Input
                placeholder="Registration document ID"
                value={form.businessDoc}
                onChange={(e) => handleChange('businessDoc', e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tax ID</label>
              <Input
                placeholder="Tax identification number"
                value={form.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12 text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 text-base"
            disabled={applyMutation.isPending}
          >
            {applyMutation.isPending ? 'Submitting...' : 'Create Store'}
          </Button>
        </div>

        {applyMutation.isError && (
          <p className="text-destructive text-sm mt-3 text-center">
            {(applyMutation.error as Error).message}
          </p>
        )}
      </form>
    </div>
  );
}
