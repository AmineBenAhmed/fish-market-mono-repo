import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Store, User } from 'lucide-react';

import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate } from '../../lib/utils';
import { sellerService } from '../../services';

export function StorePage() {
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['seller', 'profile'],
    queryFn: sellerService.getProfile,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4 pt-2">
        <h2 className="text-xl font-bold">My Store</h2>
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-destructive font-medium">Failed to load store</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error ? (error as Error).message : 'Store not found'}
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
              {profile.verificationStatus}
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
