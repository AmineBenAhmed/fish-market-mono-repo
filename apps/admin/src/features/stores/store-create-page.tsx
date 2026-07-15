import { Button, Input, AddressForm } from '@fishmarket/ui';
import type { AddressFormValue } from '@fishmarket/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImageIcon, Loader2, Plus, Search, User, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/shared/page-header';
import { MapPicker } from '../../components/shared/map-picker';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { cloudinaryService, sellersService, usersService } from '../../services';
import type { User as UserType } from '../../types';

export function StoreCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [userCode, setUserCode] = useState('');
  const [lookedUpUser, setLookedUpUser] = useState<UserType | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    commissionRate: '0',
    deliveryRadius: 10,
    preparationTime: 30,
    lat: '',
    lng: '',
    businessName: '',
    businessDoc: '',
    taxId: '',
    photo: '',
    storeLogoUrl: '',
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

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof sellersService.create>[0]) => sellersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast.success('Store created successfully');
      navigate('/stores');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        (err as Error).message ||
        'Failed to create store';
      toast.error(msg);
    },
  });

  const handleLookup = async () => {
    if (!userCode.trim()) return;
    setLookingUp(true);
    setLookupError('');
    setLookedUpUser(null);
    try {
      const user = await usersService.findByCode(userCode.trim().toUpperCase());
      setLookedUpUser(user);
    } catch {
      setLookupError('No user found with this code');
    } finally {
      setLookingUp(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookedUpUser) {
      toast.error('Please search and select a user first');
      return;
    }
    if (!form.storeName) {
      toast.error('Store name is required');
      return;
    }
    if (!address.areaId) {
      toast.error('Please select an area');
      return;
    }
    if (!address.zoneId) {
      toast.error('Please select a zone');
      return;
    }

    createMutation.mutate({
      userId: lookedUpUser.id,
      storeName: form.storeName,
      storeDescription: form.storeDescription || undefined,
      commissionRate: form.commissionRate ? Number(form.commissionRate) : undefined,
      deliveryRadius: form.deliveryRadius,
      preparationTime: form.preparationTime,
      governorateId: address.governorateId,
      areaId: address.areaId,
      zoneId: address.zoneId,
      street: address.street,
      buildingNumber: address.buildingNumber || undefined,
      apartment: address.apartment || undefined,
      floor: address.floor || undefined,
      landmark: address.landmark || undefined,
      lat: form.lat ? Number(form.lat) : undefined,
      lng: form.lng ? Number(form.lng) : undefined,
      businessName: form.businessName || undefined,
      businessDoc: form.businessDoc || undefined,
      taxId: form.taxId || undefined,
      photo: form.photo || undefined,
      storeLogoUrl: form.storeLogoUrl || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Store" description="Create a new seller store">
        <Button variant="outline" onClick={() => navigate('/stores')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stores
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Lookup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  User Code <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter the 6-character user code"
                    value={userCode}
                    onChange={(e) => {
                      setUserCode(e.target.value.toUpperCase().slice(0, 6));
                      setLookedUpUser(null);
                      setLookupError('');
                    }}
                    className="uppercase font-mono"
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLookup}
                    disabled={lookingUp || !userCode.trim()}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {lookupError && <p className="text-destructive text-xs mt-1">{lookupError}</p>}
                {lookedUpUser && (
                  <div className="flex items-center gap-3 mt-2 p-3 rounded-lg border bg-muted/50">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">{lookedUpUser.name}</p>
                      <p className="text-muted-foreground">{lookedUpUser.email}</p>
                    </div>
                    <Badge className="ml-auto">{lookedUpUser.role}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Store Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="My Store"
                  value={form.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  required
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Optional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input
                  placeholder="Store description"
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
                <label className="text-sm font-medium mb-1 block">Delivery Radius (km)</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="10"
                  value={form.deliveryRadius}
                  onChange={(e) => handleChange('deliveryRadius', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Preparation Time (min)</label>
                <Input
                  type="number"
                  min={0}
                  placeholder="30"
                  value={form.preparationTime}
                  onChange={(e) => handleChange('preparationTime', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Commission Rate (%)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="0"
                  value={form.commissionRate}
                  onChange={(e) => handleChange('commissionRate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Business Name</label>
                <Input
                  placeholder="Legal business name"
                  value={form.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Business Doc</label>
                <Input
                  placeholder="Registration document ID"
                  value={form.businessDoc}
                  onChange={(e) => handleChange('businessDoc', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tax ID</label>
                <Input
                  placeholder="Tax identification number"
                  value={form.taxId}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MapPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(lat, lng) => {
                  setForm((prev) => ({ ...prev, lat, lng }));
                }}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Latitude</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="36.8065"
                    value={form.lat}
                    onChange={(e) => handleChange('lat', e.target.value)}
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" type="button" onClick={() => navigate('/stores')}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || !lookedUpUser}>
            <Plus className="mr-2 h-4 w-4" />
            {createMutation.isPending ? 'Creating...' : 'Create Store'}
          </Button>
        </div>

        {createMutation.isError && (
          <p className="text-destructive text-sm mt-2 text-right">
            Failed to create store: {(createMutation.error as Error).message}
          </p>
        )}
      </form>
    </div>
  );
}
