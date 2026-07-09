import { Button, Input, AddressForm } from '@fishmarket/ui';
import type { AddressFormValue } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ArrowLeft, ImagePlus, MapPin, Plus, Store, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogClose, DialogContent } from '../../components/ui/dialog';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../lib/utils';
import { cloudinaryService, sellerService } from '../../services';
import type { SellerProfile } from '../../types';

type View = 'list' | 'detail' | 'create';

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'SUSPENDED':
      return 'bg-gray-900 text-gray-50';
    default:
      return 'bg-amber-100 text-amber-800';
  }
};

export function StorePage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>('list');
  const [selectedStore, setSelectedStore] = useState<SellerProfile | null>(null);

  const {
    data: profiles,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['seller', 'profiles'],
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

  if (error && !profiles) {
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

  const storeList = profiles || [];

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
        <h2 className="text-xl font-bold">My Stores</h2>
        <Button className="hover:bg-gray-500" onClick={() => setView('create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Store
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
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground max-md:hidden">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {storeList.map((profile) => (
                <tr
                  key={profile.id}
                  onClick={() => {
                    setSelectedStore(profile);
                    setView('detail');
                  }}
                  className="border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{profile.storeName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{profile.city || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground max-sm:hidden">
                    {profile.state || '—'}
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">
                    <Badge className={statusBadgeClass(profile.verificationStatus)}>
                      {profile.verificationStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-md:hidden">
                    {formatDate(profile.createdAt)}
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold truncate">{store.storeName}</h2>
        <Badge className={statusBadgeClass(store.verificationStatus)}>
          {store.verificationStatus}
        </Badge>
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
            {store.photo && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Registration Photo</p>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="p-0 border-0 bg-transparent cursor-pointer"
                >
                  <img
                    src={store.photo}
                    alt="Registration"
                    className="h-24 w-24 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                  />
                </button>
              </div>
            )}
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
            {store.businessName && (
              <div>
                <p className="text-sm text-muted-foreground">Business Name</p>
                <p className="font-medium">{store.businessName}</p>
              </div>
            )}
            {store.businessDoc && (
              <div>
                <p className="text-sm text-muted-foreground">Registration Number</p>
                <p className="font-medium">{store.businessDoc}</p>
              </div>
            )}
            {store.taxId && (
              <div>
                <p className="text-sm text-muted-foreground">Tax ID</p>
                <p className="font-medium">{store.taxId}</p>
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
              <p className="font-medium">
                {store.street || '—'}
                {store.buildingNumber ? `, ${store.buildingNumber}` : ''}
                {store.floor ? `, Floor ${store.floor}` : ''}
                {store.apartment ? `, Apt ${store.apartment}` : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission Rate</p>
              <p className="font-medium">{(store.commissionRate * 100).toFixed(0)}%</p>
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

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl p-2 bg-transparent border-0 shadow-none">
          <DialogClose className="absolute -top-10 right-0 text-white opacity-70 hover:opacity-100">
            <X className="h-6 w-6" />
          </DialogClose>
          {store.photo && (
            <img
              src={store.photo}
              alt="Registration photo"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateStoreForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    businessName: '',
    businessDoc: '',
    taxId: '',
    preparationTime: '30',
    deliveryRadius: '10',
  });

  const [address, setAddress] = useState<AddressFormValue>({
    governorateId: 'sousse',
    areaId: '',
    zoneId: '',
    street: '',
    buildingNumber: '',
    apartment: '',
    floor: '',
    landmark: '',
    label: '',
    lat: '',
    lng: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: {
      storeName: string;
      storeDescription?: string;
      governorateId: string;
      areaId: string;
      zoneId: string;
      street: string;
      buildingNumber?: string;
      apartment?: string;
      floor?: string;
      landmark?: string;
      preparationTime?: number;
      deliveryRadius?: number;
      lat?: number;
      lng?: number;
      businessName?: string;
      businessDoc?: string;
      taxId?: string;
      photo?: string;
    }) => sellerService.apply(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'profiles'] });
    },
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.storeName || !address.areaId || !address.zoneId || !address.street) return;

    let photoUrl: string | undefined;

    if (photoFile) {
      setUploadingPhoto(true);
      try {
        const result = await cloudinaryService.upload(photoFile);
        photoUrl = result.url;
      } catch {
        setSubmitError('Failed to upload registration photo');
        setUploadingPhoto(false);
        return;
      }
      setUploadingPhoto(false);
    }

    try {
      await createMutation.mutateAsync({
        storeName: form.storeName,
        storeDescription: form.storeDescription || undefined,
        governorateId: address.governorateId,
        areaId: address.areaId,
        zoneId: address.zoneId,
        street: address.street,
        buildingNumber: address.buildingNumber || undefined,
        apartment: address.apartment || undefined,
        floor: address.floor || undefined,
        landmark: address.landmark || undefined,
        preparationTime: form.preparationTime ? Number(form.preparationTime) : undefined,
        deliveryRadius: form.deliveryRadius ? Number(form.deliveryRadius) : undefined,
        lat: address.lat ? Number(address.lat) : undefined,
        lng: address.lng ? Number(address.lng) : undefined,
        businessName: form.businessName || undefined,
        businessDoc: form.businessDoc || undefined,
        taxId: form.taxId || undefined,
        photo: photoUrl,
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
              Your store has been created and is pending approval.
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
            <div>
              <label className="text-sm font-medium mb-1 block">
                Address <span className="text-destructive">*</span>
              </label>
              <AddressForm
                value={address}
                onChange={setAddress}
                showLabel={false}
                showCoordinates={false}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Contact & Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Registration Photo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {photoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Registration preview"
                    className="h-32 w-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors justify-center"
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                </button>
              )}
            </div>
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
              <label className="text-sm font-medium mb-1 block">Registration Number</label>
              <Input
                placeholder="Business registration document ID"
                value={form.businessDoc}
                onChange={(e) => handleChange('businessDoc', e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tax ID (optional)</label>
              <Input
                placeholder="Tax identification number"
                value={form.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Delivery Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Preparation Time (min)</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="30"
                  value={form.preparationTime}
                  onChange={(e) => handleChange('preparationTime', e.target.value)}
                  className="h-12 text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Delivery Radius (km)</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="10"
                  value={form.deliveryRadius}
                  onChange={(e) => handleChange('deliveryRadius', e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="36.8065"
                  value={address.lat}
                  onChange={(e) => setAddress((prev) => ({ ...prev, lat: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="10.1815"
                  value={address.lng}
                  onChange={(e) => setAddress((prev) => ({ ...prev, lng: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>
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
            disabled={createMutation.isPending || uploadingPhoto}
          >
            {uploadingPhoto
              ? 'Uploading photo...'
              : createMutation.isPending
                ? 'Creating...'
                : 'Create Store'}
          </Button>
        </div>
      </form>
    </div>
  );
}
