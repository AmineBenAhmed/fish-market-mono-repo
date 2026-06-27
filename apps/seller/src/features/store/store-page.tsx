import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ArrowLeft, MapPin, Plus, Store, User } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate } from '../../lib/utils';
import { sellerService } from '../../services';
import type { SellerProfile } from '../../types';

type View = 'list' | 'detail' | 'create';

function statusBadgeClass(status: string) {
  if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-800';
  if (status === 'REJECTED') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
}

function statusLabel(status: string) {
  if (status === 'PENDING') return 'Pending Approval';
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  return status;
}

export function StorePage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>('list');
  const [selectedStore, setSelectedStore] = useState<SellerProfile | null>(null);

  const {
    data: stores,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['seller', 'stores'],
    queryFn: sellerService.listStores,
    retry: false,
  });

  if (view === 'detail' && selectedStore) {
    return (
      <StoreDetail
        store={selectedStore}
        onBack={() => {
          setView('list');
          setSelectedStore(null);
        }}
      />
    );
  }

  if (view === 'create') {
    return <CreateStoreForm onBack={() => setView('list')} onSuccess={() => setView('list')} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error && !stores) {
    return (
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-bold">My Stores</h2>
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-destructive font-medium">Failed to load stores</p>
            <p className="text-sm text-muted-foreground mt-1">{'An unexpected error occurred'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const storeList = stores || [];

  if (storeList.length === 0) {
    return (
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-bold">My Stores</h2>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Store className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <p className="text-lg font-medium">You don't have a store yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your store to start selling on FishMarket
              </p>
            </div>
            <Button onClick={() => setView('create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2 w-full">
      <div className="flex items-center justify-between mr-4">
        <h2 className="text-xl font-bold">Mes Stores</h2>
        <Button
          className=" hover:bg-gray-500 hover:text-black-200"
          onClick={() => setView('create')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter poissonerie
        </Button>
      </div>

      {isFetching && <p className="text-sm text-muted-foreground">Refreshing...</p>}

      <div className="max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Store Name
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  City
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground max-sm:hidden">
                  Active
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground max-md:hidden">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {storeList.map((store) => (
                <tr
                  key={store.id}
                  onClick={() => {
                    setSelectedStore(store);
                    setView('detail');
                  }}
                  className="border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{store.storeName}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusBadgeClass(store.verificationStatus)}>
                      {statusLabel(store.verificationStatus)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {store.city}
                    {store.state ? `, ${store.state}` : ''}
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">
                    <Badge
                      className={
                        store.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {store.isActive ? 'Yes' : 'No'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-md:hidden">
                    {formatDate(store.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StoreDetail({ store, onBack }: { store: SellerProfile; onBack: () => void }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold truncate">{store.storeName}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
              <p className="font-semibold text-lg">{store.storeName}</p>
            </div>
            {store.storeDescription && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-base">{store.storeDescription}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Store ID</p>
              <p className="font-mono text-sm">{store.id}</p>
            </div>
            {store.storeLogoFileId && (
              <div>
                <p className="text-sm text-muted-foreground">Logo File ID</p>
                <p className="font-mono text-sm">{store.storeLogoFileId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">City</p>
              <p className="font-medium">{store.city}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">State</p>
              <p className="font-medium">{store.state}</p>
            </div>
            {store.lat !== null && store.lat !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Latitude</p>
                <p className="font-medium">{store.lat}</p>
              </div>
            )}
            {store.lng !== null && store.lng !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Longitude</p>
                <p className="font-medium">{store.lng}</p>
              </div>
            )}
            {store.pickupAddress && (
              <div>
                <p className="text-sm text-muted-foreground">Pickup Address</p>
                <p className="font-medium">{store.pickupAddress}</p>
              </div>
            )}
            {store.deliveryZoneId && (
              <div>
                <p className="text-sm text-muted-foreground">Delivery Zone ID</p>
                <p className="font-mono text-sm">{store.deliveryZoneId}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {store.businessName && (
              <div>
                <p className="text-sm text-muted-foreground">Business Name</p>
                <p className="font-medium">{store.businessName}</p>
              </div>
            )}
            {store.businessDoc && (
              <div>
                <p className="text-sm text-muted-foreground">Business Document</p>
                <p className="font-medium">{store.businessDoc}</p>
              </div>
            )}
            {store.taxId && (
              <div>
                <p className="text-sm text-muted-foreground">Tax ID</p>
                <p className="font-medium">{store.taxId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Commission Rate</p>
              <p className="font-medium">{(Number(store.commissionRate) * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivery Radius</p>
              <p className="font-medium">{store.deliveryRadius} km</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Preparation Time</p>
              <p className="font-medium">{store.preparationTime} min</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">Status & Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground">Verification</p>
              <Badge className={statusBadgeClass(store.verificationStatus)}>
                {statusLabel(store.verificationStatus)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Store Active</p>
              <Badge
                className={
                  store.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                }
              >
                {store.isActive ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(store.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">{formatDate(store.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateStoreForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
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
      queryClient.invalidateQueries({ queryKey: ['seller', 'stores'] });
      onSuccess();
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.data?.message === 'Already registered as a seller') {
        queryClient.invalidateQueries({ queryKey: ['seller', 'stores'] });
        onSuccess();
      }
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
        <h2 className="text-xl font-bold">My Stores</h2>
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Store className="h-16 w-16 text-emerald-600 mx-auto" />
            <p className="text-lg font-medium text-emerald-700">Store Created!</p>
            <p className="text-sm text-muted-foreground">
              Your store is now pending approval. You'll be notified once it's approved.
            </p>
            <Button onClick={onBack} className="mt-4">
              Back to Stores
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Create Your Store</h2>
      </div>
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
