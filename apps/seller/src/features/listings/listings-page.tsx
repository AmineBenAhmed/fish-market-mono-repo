import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Minus } from 'lucide-react';
import { useState } from 'react';

import { Button, Input } from '@fishmarket/ui';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency, statusColor } from '../../lib/utils';
import { catalogService, listingsService } from '../../services';
import type { Product } from '../../types';

export function ListingsPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ['seller', 'listings', 'today'],
    queryFn: listingsService.getToday,
  });

  const { data: products } = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: catalogService.getProducts,
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      productId: string;
      variantId?: string;
      price: number;
      quantity: number;
    }) => listingsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'listings'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      listingsService.update(id, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'listings'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => listingsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'listings'] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Today's Listings</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="h-10">
          <Plus className="h-4 w-4 mr-1" />
          Add Fish
        </Button>
      </div>

      {showForm && (
        <AddListingForm
          products={products ?? []}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isPending={createMutation.isPending}
        />
      )}

      {!listings || listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No fish listed for today</p>
            <p className="text-sm text-muted-foreground mt-1">Tap "Add Fish" to start selling</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Card key={listing.id} className={listing.status !== 'ACTIVE' ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{listing.productName}</h3>
                      <Badge className={statusColor(listing.status)}>{listing.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{listing.variantName}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-bold text-lg">{formatCurrency(Number(listing.price))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Stock</p>
                        <div className="flex items-center gap-2">
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-full border active:bg-accent"
                            onClick={() =>
                              updateMutation.mutate({
                                id: listing.id,
                                quantity: Math.max(0, listing.quantity - 1),
                              })
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold text-lg min-w-[2ch] text-center">
                            {listing.quantity}
                          </span>
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-full border active:bg-accent"
                            onClick={() =>
                              updateMutation.mutate({
                                id: listing.id,
                                quantity: listing.quantity + 1,
                              })
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <span className="text-xs text-muted-foreground">{listing.unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-destructive/10"
                    onClick={() => {
                      if (window.confirm(`Remove ${listing.productName}?`)) {
                        deleteMutation.mutate(listing.id);
                      }
                    }}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AddListingForm({
  products,
  onSubmit,
  onCancel,
  isPending,
}: {
  products: Product[];
  onSubmit: (data: {
    productId: string;
    variantId?: string;
    price: number;
    quantity: number;
  }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !price || !quantity) return;
    onSubmit({
      productId: selectedProductId,
      variantId: selectedVariantId || undefined,
      price: Number(price),
      quantity: Number(quantity),
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Fish Type</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setSelectedVariantId('');
              }}
              className="w-full h-12 rounded-lg border border-input bg-background px-3 text-base"
              required
            >
              <option value="">Select fish...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && selectedProduct.variants.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1 block">Variant / Size</label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full h-12 rounded-lg border border-input bg-background px-3 text-base"
              >
                <option value="">Select variant...</option>
                {selectedProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.unit})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Price (TND)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Quantity</label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-12">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Listing'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
