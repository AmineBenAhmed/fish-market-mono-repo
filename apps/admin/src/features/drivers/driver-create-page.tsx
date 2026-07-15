import { Button, Input, AddressForm } from '@fishmarket/ui';
import type { AddressFormValue } from '@fishmarket/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImageIcon, Loader2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '../../components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { cloudinaryService, driversService } from '../../services';

const vehicleTypes = [
  { value: 'MOTO', label: 'Moto' },
  { value: 'BICYCLE', label: 'Bicycle' },
  { value: 'CAR', label: 'Car' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'TRUCK_WITH_FREEZER', label: 'Truck with Freezer' },
];

export function DriverCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    phone2: '',
    city: '',
    state: '',
    vehicleType: '',
    status: 'OFFLINE',
    idCardNumber: '',
    idCardPhoto: '',
    deliveryFee: '',
    password: '',
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

  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await cloudinaryService.upload(file);
      setForm((prev) => ({ ...prev, idCardPhoto: result.url }));
    } catch {
      toast.error('Failed to upload ID card photo');
    } finally {
      setUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof driversService.createDriver>[0]) =>
      driversService.createDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver created successfully');
      navigate('/drivers');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to create driver';
      toast.error(message);
    },
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: form.name,
      phone: form.phone,
      phone2: form.phone2 || undefined,
      city: form.city,
      state: form.state,
      vehicleType: form.vehicleType,
      status: form.status as 'ONLINE' | 'OFFLINE',
      idCardNumber: form.idCardNumber || undefined,
      idCardPhoto: form.idCardPhoto || undefined,
      governorateId: address.governorateId || undefined,
      areaId: address.areaId || undefined,
      zoneId: address.zoneId || undefined,
      street: address.street || undefined,
      buildingNumber: address.buildingNumber || undefined,
      apartment: address.apartment || undefined,
      floor: address.floor || undefined,
      landmark: address.landmark || undefined,
      deliveryFee: form.deliveryFee ? parseFloat(form.deliveryFee) : undefined,
      password: form.password || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Driver" description="Register a new delivery driver">
        <Button variant="outline" onClick={() => navigate('/drivers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Drivers
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone 1 *</label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone 2 (optional)</label>
                <Input
                  value={form.phone2}
                  onChange={(e) => handleChange('phone2', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">City *</label>
                <Input
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">State *</label>
                <Input
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ID & Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">ID Card Number</label>
                <Input
                  value={form.idCardNumber}
                  onChange={(e) => handleChange('idCardNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ID Card Photo</label>
                <div className="flex items-center gap-3">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    {form.idCardPhoto ? 'Change' : 'Upload'}
                  </Button>
                  {form.idCardPhoto && (
                    <div className="relative">
                      <img
                        src={form.idCardPhoto}
                        alt="ID Card"
                        className="h-12 w-12 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, idCardPhoto: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Vehicle Type *</label>
                <Select
                  value={form.vehicleType}
                  onValueChange={(v) => handleChange('vehicleType', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((vt) => (
                      <SelectItem key={vt.value} value={vt.value}>
                        {vt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Preferred Working Zone</label>
                <AddressForm
                  value={address}
                  onChange={setAddress}
                  showLabel={false}
                  showCoordinates={false}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Delivery Fee (TND)</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.deliveryFee}
                  onChange={(e) => handleChange('deliveryFee', e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Password <span className="text-xs text-muted-foreground">(for driver login)</span>
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Leave empty for random"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" type="button" onClick={() => navigate('/drivers')}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Driver'}
          </Button>
        </div>

        {createMutation.isError && (
          <p className="text-destructive text-sm mt-2 text-right">
            Failed to create: {(createMutation.error as Error).message}
          </p>
        )}

        {createMutation.isSuccess && (
          <p className="text-emerald-600 text-sm mt-2 text-right">Driver created successfully.</p>
        )}
      </form>
    </div>
  );
}
