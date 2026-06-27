import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Fish, MapPin, Package, ShoppingCart, Store } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency, formatDate } from '../../lib/utils';
import { listingsService } from '../../services';

function statusBadgeClass(status: string) {
  return status === 'ACTIVE'
    ? 'bg-emerald-100 text-emerald-800'
    : status === 'OUT_OF_STOCK'
      ? 'bg-gray-100 text-gray-500'
      : 'bg-red-100 text-red-800';
}

function statusLabel(status: string) {
  return status === 'OUT_OF_STOCK' ? 'Sold Out' : status.charAt(0) + status.slice(1).toLowerCase();
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: listing, isLoading } = useQuery({
    queryKey: ['seller', 'listings', id],
    queryFn: () => listingsService.getOne(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="pt-4 text-center">
        <p className="text-muted-foreground">Listing not found</p>
        <button onClick={() => navigate('/listings')} className="text-sm text-primary mt-2">
          Back to listings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2 mb-20">
      <button
        onClick={() => navigate('/listings')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {listing.title || listing.product?.name || 'Fish Listing'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created {formatDate(listing.createdAt)}
                  </p>
                </div>
                <Badge className={statusBadgeClass(listing.status)}>
                  {statusLabel(listing.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {listing.description && (
                <p className="text-sm text-muted-foreground">{listing.description}</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Package className="h-3 w-3" /> Price
                  </p>
                  <p className="text-lg font-bold">{formatCurrency(Number(listing.price))}</p>
                  <p className="text-xs text-muted-foreground">/ {listing.unit || 'unit'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" /> Quantity
                  </p>
                  <p className="text-lg font-bold">{listing.quantity}</p>
                  <p className="text-xs text-muted-foreground">
                    {listing.unit || 'units'} available
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" /> Bought
                  </p>
                  <p className="text-lg font-bold text-primary">{listing.boughtQuantity ?? 0}</p>
                  <p className="text-xs text-muted-foreground">units sold</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3" /> Revenue
                  </p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCurrency(listing.boughtTotal ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">total from sales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {listing.images && listing.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {listing.images.map((img) => (
                    <div key={img.id} className="aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={img.file?.url}
                        alt={img.file?.originalName ?? ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-4 w-4" />
                Store
              </CardTitle>
            </CardHeader>
            <CardContent>
              {listing.store ? (
                <div>
                  <p className="font-medium">{listing.store.name}</p>
                  {listing.store.city && (
                    <p className="text-sm text-muted-foreground">{listing.store.city}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No store assigned</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Fish className="h-4 w-4" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{listing.product?.category?.name || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium">
                  {listing.condition
                    ? listing.condition.charAt(0) + listing.condition.slice(1).toLowerCase()
                    : '—'}
                </span>
              </div>
              {listing.origin && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Origin
                  </span>
                  <span className="font-medium">{listing.origin}</span>
                </div>
              )}
              {listing.averageWeight && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Weight</span>
                  <span className="font-medium">{listing.averageWeight} kg</span>
                </div>
              )}
              {listing.catchDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Catch Date
                  </span>
                  <span className="font-medium">{formatDate(listing.catchDate)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Availability</span>
                <span className="font-medium">
                  {listing.availabilityDate
                    ? formatDate(listing.availabilityDate)
                    : formatDate(listing.date)}
                </span>
              </div>
            </CardContent>
          </Card>

          {listing.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{listing.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
