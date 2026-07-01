import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImageIcon, Loader2, Save, Store, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '../../components/shared/page-header';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate, statusColor } from '../../lib/utils';
import { cloudinaryService, sellersService } from '../../services';
import { Dialog, DialogContent, DialogClose } from '../../components/ui/dialog';

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: store,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['store', id],
    queryFn: () => sellersService.getSeller(id!),
    enabled: !!id,
  });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File, field: 'photo' | 'storeLogoUrl') => {
    if (field === 'photo') setUploadingPhoto(true);
    else setUploadingLogo(true);
    try {
      const result = await cloudinaryService.upload(file);
      setForm((prev) => ({ ...prev, [field]: result.url }));
    } catch {
      console.error(`Failed to upload ${field}`);
    } finally {
      if (field === 'photo') setUploadingPhoto(false);
      else setUploadingLogo(false);
    }
  };

  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    deliveryRadius: 10,
    preparationTime: 30,
    pickupAddress: '',
    businessName: '',
    businessDoc: '',
    taxId: '',
    isActive: false,
    photo: '',
    storeLogoUrl: '',
  });

  useEffect(() => {
    if (store) {
      setForm({
        storeName: store.storeName || '',
        storeDescription: store.storeDescription || '',
        deliveryRadius: store.deliveryRadius ?? 10,
        preparationTime: store.preparationTime ?? 30,
        pickupAddress: store.pickupAddress || '',
        businessName: store.businessName || '',
        businessDoc: store.businessDoc || '',
        taxId: store.taxId || '',
        isActive: store.isActive,
        photo: store.photo || '',
        storeLogoUrl: store.storeLogoUrl || '',
      });
    }
  }, [store]);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof sellersService.update>[1]) =>
      sellersService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store', id] });
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading Store..." description="Fetching store details" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="space-y-6">
        <PageHeader title="Store Not Found" description="The requested store could not be loaded">
          <Button variant="outline" onClick={() => navigate('/stores')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stores
          </Button>
        </PageHeader>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Store className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-destructive font-medium">Failed to load store</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(error as Error)?.message || 'Store not found'}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/stores')}>
                Return to Stores
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      storeName: form.storeName,
      storeDescription: form.storeDescription || undefined,
      deliveryRadius: form.deliveryRadius,
      preparationTime: form.preparationTime,
      pickupAddress: form.pickupAddress || undefined,
      businessName: form.businessName || undefined,
      businessDoc: form.businessDoc || undefined,
      taxId: form.taxId || undefined,
      isActive: form.isActive,
      photo: form.photo || undefined,
      storeLogoUrl: form.storeLogoUrl || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={store.storeName}
        description={`Store details • ${store.user?.name || store.storeName}`}
      >
        <Button variant="outline" onClick={() => navigate('/stores')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stores
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                {store.photo && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Registration Photo</label>
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
                {store.storeLogoUrl && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Store Logo</label>
                    <img
                      src={store.storeLogoUrl}
                      alt="Store Logo"
                      className="h-24 w-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Store Name</label>
                <Input
                  value={form.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input
                  value={form.storeDescription}
                  onChange={(e) => handleChange('storeDescription', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Registration Photo</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'photo');
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    {form.photo ? 'Change' : 'Upload'}
                  </Button>
                  {form.photo && (
                    <div className="relative">
                      <img
                        src={form.photo}
                        alt="Registration"
                        className="h-12 w-12 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, photo: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Store Logo</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'storeLogoUrl');
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    {uploadingLogo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    {form.storeLogoUrl ? 'Change' : 'Upload'}
                  </Button>
                  {form.storeLogoUrl && (
                    <div className="relative">
                      <img
                        src={form.storeLogoUrl}
                        alt="Store Logo"
                        className="h-12 w-12 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, storeLogoUrl: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Business Name</label>
                <Input
                  value={form.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tax ID</label>
                <Input value={form.taxId} onChange={(e) => handleChange('taxId', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Business Doc</label>
                <Input
                  value={form.businessDoc}
                  onChange={(e) => handleChange('businessDoc', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Delivery Radius (km)</label>
                <Input
                  type="number"
                  min={0}
                  value={form.deliveryRadius}
                  onChange={(e) => handleChange('deliveryRadius', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Preparation Time (min)</label>
                <Input
                  type="number"
                  min={0}
                  value={form.preparationTime}
                  onChange={(e) => handleChange('preparationTime', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Pickup Address</label>
                <Input
                  value={form.pickupAddress}
                  onChange={(e) => handleChange('pickupAddress', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Store Active
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Owner Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input value={store.user?.name || '-'} disabled className="bg-muted" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input value={store.user?.email || '-'} disabled className="bg-muted" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <Input value={store.user?.phone || '-'} disabled className="bg-muted" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">User Status</label>
                <div>
                  {store.user && (
                    <Badge className={statusColor(store.user.status)}>{store.user.status}</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Protected Fields (Read Only)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Commission Rate</label>
                <Input
                  value={`${(Number(store.commissionRate) * 100).toFixed(1)}%`}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">City</label>
                <Input value={store.city || '-'} disabled className="bg-muted" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">State</label>
                <Input value={store.state || '-'} disabled className="bg-muted" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Coordinates</label>
                <Input
                  value={
                    store.lat && store.lng
                      ? `${Number(store.lat).toFixed(4)}, ${Number(store.lng).toFixed(4)}`
                      : '-'
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Verification</label>
                <div>
                  <Badge className={statusColor(store.verificationStatus)}>
                    {store.verificationStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Joined</label>
                <Input value={formatDate(store.createdAt)} disabled className="bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" type="button" onClick={() => navigate('/stores')}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {updateMutation.isError && (
          <p className="text-destructive text-sm mt-2 text-right">
            Failed to save: {(updateMutation.error as Error).message}
          </p>
        )}

        {updateMutation.isSuccess && (
          <p className="text-emerald-600 text-sm mt-2 text-right">Store updated successfully.</p>
        )}
      </form>

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
