import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Search, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/shared/page-header';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { sellersService, usersService } from '../../services';
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
    deliveryRadius: 10,
    preparationTime: 30,
    city: '',
    state: '',
    lat: '',
    lng: '',
    pickupAddress: '',
    businessName: '',
    businessDoc: '',
    taxId: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof sellersService.create>[0]) => sellersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      navigate('/stores');
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
    if (!lookedUpUser || !form.storeName || !form.city || !form.state) return;

    createMutation.mutate({
      userId: lookedUpUser.id,
      storeName: form.storeName,
      storeDescription: form.storeDescription || undefined,
      deliveryRadius: form.deliveryRadius ? Number(form.deliveryRadius) : undefined,
      preparationTime: form.preparationTime ? Number(form.preparationTime) : undefined,
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
                  City <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Tunis"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
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
                  required
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
                <label className="text-sm font-medium mb-1 block">Pickup Address</label>
                <Input
                  placeholder="123 Main St"
                  value={form.pickupAddress}
                  onChange={(e) => handleChange('pickupAddress', e.target.value)}
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
