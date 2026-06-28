import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ArrowLeft, MapPin, Plus, Store } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate } from '../../lib/utils';
import { storesService } from '../../services';
import type { Store as SellerStore } from '../../types';

type View = 'list' | 'detail' | 'create';

export function StorePage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>('list');
  const [selectedStore, setSelectedStore] = useState<SellerStore | null>(null);

  const {
    data: stores,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['seller', 'stores-data'],
    queryFn: storesService.getStores,
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
      <div className="flex items-center justify-between w-full mr-4">
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

      <div className="mx-auto w-full">
        <div className="bg-white rounded-xl border overflow-x-auto w-full">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Store Name
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  City
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground max-sm:hidden">
                  State
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground max-sm:hidden">
                  Active
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground max-md:hidden">
                  Phone
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
                  <td className="px-4 py-3 font-medium">{store.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{store.city || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground max-sm:hidden">
                    {store.state || '—'}
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">
                    <span
                      className={
                        store.isActive
                          ? 'bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-medium'
                          : 'bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium'
                      }
                    >
                      {store.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-md:hidden">
                    {store.phone || '—'}
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

function StoreDetail({ store, onBack }: { store: SellerStore; onBack: () => void }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold truncate">{store.name}</h2>
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
              <p className="font-semibold text-lg">{store.name}</p>
            </div>
            {store.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-base">{store.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Store ID</p>
              <p className="font-mono text-sm">{store.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Location & Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{store.address || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">City</p>
              <p className="font-medium">{store.city || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">State</p>
              <p className="font-medium">{store.state || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{store.phone || '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">Status & Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <span
              className={
                store.isActive
                  ? 'bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-medium'
                  : 'bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium'
              }
            >
              {store.isActive ? 'Yes' : 'No'}
            </span>
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
    name: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
    }) => storesService.create(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'stores-data'] });
    },
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.name || !form.city || !form.state) return;

    try {
      await createMutation.mutateAsync({
        name: form.name,
        description: form.description || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        city: form.city,
        state: form.state,
      });
      onSuccess();
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message || (err as Error).message || 'Failed to create store';
      setSubmitError(message);
    }
  };

  if (createMutation.isSuccess) {
    return (
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-bold">My Stores</h2>
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Store className="h-16 w-16 text-emerald-600 mx-auto" />
            <p className="text-lg font-medium text-emerald-700">Store Created!</p>
            <p className="text-sm text-muted-foreground">
              Your store has been created successfully.
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

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          <p className="font-medium mb-1">Failed to create store</p>
          <p>{submitError}</p>
        </div>
      )}

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
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                placeholder="Tell customers about your store..."
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
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
            <CardTitle className="text-base">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input
                placeholder="+216 XX XXX XXX"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Address</label>
              <Input
                placeholder="123 Fisherman St"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
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
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Store'}
          </Button>
        </div>
      </form>
    </div>
  );
}
