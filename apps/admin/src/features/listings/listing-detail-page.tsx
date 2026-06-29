import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, DollarSign, Fish, Info, MapPin, Package, Store } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@fishmarket/ui';

import { PageHeader } from '../../components/shared/page-header';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatDate, statusColor } from '../../lib/utils';
import { listingsService } from '../../services';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: listing,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsService.getListing(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading Listing..." description="Fetching listing details" />
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

  if (error || !listing) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Listing Not Found"
          description="The requested listing could not be loaded"
        >
          <Button variant="outline" onClick={() => navigate('/listings')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
        </PageHeader>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-destructive font-medium">Failed to load listing</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(error as Error)?.message || 'Listing not found'}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/listings')}>
                Return to Listings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <label className="text-sm font-medium mb-1 block text-muted-foreground">{label}</label>
      <div className="text-sm">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={listing.title || listing.product?.name || 'Listing'}
        description={`Listing details • ${listing.seller?.storeName || 'Unknown Store'}`}
      >
        <Button variant="outline" onClick={() => navigate('/listings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Listings
        </Button>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Listing Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label="Status"
              value={<Badge className={statusColor(listing.status)}>{listing.status}</Badge>}
            />
            <Field label="Title" value={listing.title || '-'} />
            <Field label="Description" value={listing.description || '-'} />
            <Field label="Notes" value={listing.notes || '-'} />
            <Field label="Date" value={formatDate(listing.date)} />
            <Field
              label="Catch Date"
              value={listing.catchDate ? formatDate(listing.catchDate) : '-'}
            />
            <Field
              label="Availability Date"
              value={listing.availabilityDate ? formatDate(listing.availabilityDate) : '-'}
            />
            <Field label="Created" value={formatDate(listing.createdAt)} />
            <Field label="Updated" value={formatDate(listing.updatedAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Pricing &amp; Stock</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Price" value={`${listing.price} ${listing.currency}`} />
            <Field label="Quantity" value={listing.quantity} />
            <Field label="Bought Quantity" value={listing.boughtQuantity ?? 0} />
            <Field
              label="Bought Total"
              value={
                listing.boughtTotal != null ? `${listing.boughtTotal} ${listing.currency}` : '-'
              }
            />
            <Field
              label="Average Weight"
              value={listing.averageWeight ? `${listing.averageWeight} ${listing.unit || ''}` : '-'}
            />
            <Field label="Unit" value={listing.unit || '-'} />
            <Field label="Origin" value={listing.origin || '-'} />
            <Field label="Condition" value={listing.condition || '-'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Store</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Store Name" value={listing.seller?.storeName || '-'} />
            <Field label="City" value={listing.seller?.city || '-'} />
            <Field label="State" value={listing.seller?.state || '-'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Fish className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Product</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Product Name" value={listing.product?.name || '-'} />
            <Field label="Category" value={listing.product?.category?.name || '-'} />
            <Field label="Variant" value={listing.variant?.name || '-'} />
          </CardContent>
        </Card>
      </div>

      {listing.imageUrls && listing.imageUrls.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Images</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {listing.imageUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Listing image ${i + 1}`}
                  className="h-32 w-full object-cover rounded-lg border"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
