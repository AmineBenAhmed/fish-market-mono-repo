import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, History, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate, statusColor } from '../../lib/utils';
import { driversService } from '../../services';

const vehicleTypes = [
  { value: 'MOTO', label: 'Moto' },
  { value: 'BICYCLE', label: 'Bicycle' },
  { value: 'CAR', label: 'Car' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'TRUCK_WITH_FREEZER', label: 'Truck with Freezer' },
];

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: driver, isLoading } = useQuery({
    queryKey: ['driver', id],
    queryFn: () => driversService.getDriver(id!),
    enabled: !!id,
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['driver-audit-logs', id],
    queryFn: () => driversService.getDriverAuditLogs(id!),
    enabled: !!id,
  });

  const [newPassword, setNewPassword] = useState('');

  const resetMutation = useMutation({
    mutationFn: (password: string) => driversService.resetDriverPassword(id!, password),
    onSuccess: () => {
      toast.success('Password reset successfully');
      setNewPassword('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to reset password');
    },
  });

  const handleResetPassword = () => {
    if (!newPassword) return;
    resetMutation.mutate(newPassword);
  };

  const [form, setForm] = useState({
    name: '',
    phone: '',
    phone2: '',
    city: '',
    state: '',
    vehicleType: '',
    status: 'OFFLINE' as 'ONLINE' | 'OFFLINE',
    isAvailable: true,
    idCardNumber: '',
    idCardPhoto: '',
    workingZone: '',
    vehiclePlate: '',
    licenseNumber: '',
    deliveryFee: '',
  });

  useEffect(() => {
    if (driver) {
      setForm({
        name: driver.user?.name || driver.name || '',
        phone: driver.user?.phone || driver.phone || '',
        phone2: driver.phone2 || '',
        city: driver.city || '',
        state: driver.state || '',
        vehicleType: driver.vehicleType || '',
        status: driver.status,
        isAvailable: driver.isAvailable,
        idCardNumber: driver.idCardNumber || '',
        idCardPhoto: driver.idCardPhoto || '',
        workingZone: driver.workingZone || '',
        vehiclePlate: driver.vehiclePlate || '',
        licenseNumber: driver.licenseNumber || '',
        deliveryFee: driver.deliveryFee?.toString() || '',
      });
    }
  }, [driver]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => driversService.updateDriver(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver', id] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast.success('Driver updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update driver');
    },
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, unknown> = {};
    if (form.name !== (driver?.user?.name || driver?.name)) data.name = form.name;
    if (form.phone !== (driver?.user?.phone || driver?.phone)) data.phone = form.phone;
    if (form.phone2 !== (driver?.phone2 || '')) data.phone2 = form.phone2 || undefined;
    if (form.city !== driver?.city) data.city = form.city;
    if (form.state !== driver?.state) data.state = form.state;
    if (form.vehicleType !== (driver?.vehicleType || ''))
      data.vehicleType = form.vehicleType || undefined;
    if (form.status !== driver?.status) data.status = form.status;
    if (form.isAvailable !== driver?.isAvailable) data.isAvailable = form.isAvailable;
    if (form.idCardNumber !== (driver?.idCardNumber || ''))
      data.idCardNumber = form.idCardNumber || undefined;
    if (form.idCardPhoto !== (driver?.idCardPhoto || ''))
      data.idCardPhoto = form.idCardPhoto || undefined;
    if (form.workingZone !== (driver?.workingZone || ''))
      data.workingZone = form.workingZone || undefined;
    if (form.vehiclePlate !== (driver?.vehiclePlate || ''))
      data.vehiclePlate = form.vehiclePlate || undefined;
    if (form.licenseNumber !== (driver?.licenseNumber || ''))
      data.licenseNumber = form.licenseNumber || undefined;
    if (form.deliveryFee !== (driver?.deliveryFee?.toString() || ''))
      data.deliveryFee = form.deliveryFee ? parseFloat(form.deliveryFee) : undefined;

    if (Object.keys(data).length === 0) {
      toast.info('No changes to save');
      return;
    }
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Driver not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/drivers')}>
          Back to Drivers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/drivers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {driver.user?.name || driver.name || driver.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            <Badge className={statusColor(driver.status)}>{driver.status}</Badge> Joined{' '}
            {formatDate(driver.createdAt)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone 1</label>
                <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone 2</label>
                <Input
                  value={form.phone2}
                  onChange={(e) => handleChange('phone2', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">City</label>
                <Input value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">State</label>
                <Input value={form.state} onChange={(e) => handleChange('state', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Working Zone</label>
                <Input
                  value={form.workingZone}
                  onChange={(e) => handleChange('workingZone', e.target.value)}
                  placeholder="e.g. Downtown, North District"
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
                <label className="text-sm font-medium mb-1 block">License Number</label>
                <Input
                  value={form.licenseNumber}
                  onChange={(e) => handleChange('licenseNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Vehicle Type</label>
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
                <label className="text-sm font-medium mb-1 block">Vehicle Plate</label>
                <Input
                  value={form.vehiclePlate}
                  onChange={(e) => handleChange('vehiclePlate', e.target.value)}
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
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" type="button" onClick={() => navigate('/drivers')}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>

        {updateMutation.isSuccess && (
          <p className="text-emerald-600 text-sm mt-2 text-right">Driver updated successfully.</p>
        )}
        {updateMutation.isError && (
          <p className="text-destructive text-sm mt-2 text-right">
            {(updateMutation.error as any)?.response?.data?.message || 'Failed to update'}
          </p>
        )}
      </form>

      {/* Password Reset */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <Button
              onClick={handleResetPassword}
              disabled={!newPassword || resetMutation.isPending}
            >
              {resetMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!auditLogs || auditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No changes recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{log.action}</Badge>
                      <span className="text-sm font-medium">Status changed</span>
                    </div>
                    {log.oldValue && log.newValue && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {log.oldValue?.status} &rarr; {log.newValue?.status}
                        {log.oldValue?.vehicleType &&
                          ` | Vehicle: ${log.oldValue.vehicleType} → ${log.newValue?.vehicleType}`}
                      </p>
                    )}
                    {log.user && (
                      <p className="text-xs text-muted-foreground mt-1">By: {log.user.name}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
