import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Fish,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Input } from '@fishmarket/ui';

import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency, formatDate } from '../../lib/utils';
import { listingsService, sellerService } from '../../services';
import type { Listing, SellerProfile } from '../../types';
import { ListingFormDialog } from './listing-form-dialog';
import type { ListingFormSubmitData } from './listing-form-dialog';

const FISH_CATEGORIES = [
  'Sardine',
  'Sea Bream (Dorade)',
  'Sea Bass (Loup de Mer)',
  'Red Mullet (Rouget)',
  'Mackerel (Maquereau)',
  'Anchovy',
  'Grouper',
  'Tuna',
  'Bonito',
  'Horse Mackerel',
  'Octopus',
  'Squid',
  'Shrimp',
  'Crab',
  'Cuttlefish',
  'Mussels',
  'Clams',
  'Other',
];

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

export function ListingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Listing | null>(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(1);

  const { data: result, isLoading } = useQuery({
    queryKey: ['seller', 'listings', 'all', { search, categoryFilter, fromDate, toDate, page }],
    queryFn: () =>
      listingsService.getAll({
        search: search || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        limit: 30,
      }),
  });

  const { data: stores } = useQuery({
    queryKey: ['seller', 'profiles'],
    queryFn: sellerService.listStores,
  });

  const listings = result?.data ?? [];
  const meta = result?.meta;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['seller', 'listings'] });
  }

  const createMutation = useMutation({
    mutationFn: (data: ListingFormSubmitData) => {
      return listingsService.create({
        sellerId: data.sellerId,
        categoryId: data.categoryId,
        date: new Date().toISOString(),
        price: data.price,
        quantity: data.quantity,
        title: data.description?.split('\n')[0]?.slice(0, 200) || 'New Listing',
        description: data.description,
        origin: data.origin,
        condition: data.condition,
        unit: 'Kg',
        currency: 'TND',
        cloudinaryUrls: data.cloudinaryUrls,
      });
    },
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setEditingListing(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ListingFormSubmitData }) =>
      listingsService.update(id, {
        title: data.description?.split('\n')[0]?.slice(0, 200) || undefined,
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        origin: data.origin,
        condition: data.condition,
      }),
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setEditingListing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => listingsService.remove(id),
    onSuccess: () => invalidate(),
  });

  const soldOutMutation = useMutation({
    mutationFn: (id: string) => listingsService.markSoldOut(id),
    onSuccess: () => invalidate(),
  });

  function handleFormSubmit(data: ListingFormSubmitData) {
    if (editingListing) {
      updateMutation.mutate({ id: editingListing.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function resetFilters() {
    setSearch('');
    setCategoryFilter('all');
    setFromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
    setPage(1);
  }

  if (isLoading && listings.length === 0) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Listings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your fish listings from the last 7 days
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingListing(null);
            setShowForm(true);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Listing
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 h-9 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 w-36 text-sm"
                  />
                  <span className="text-muted-foreground text-sm">—</span>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 w-36 text-sm"
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => {
                    setCategoryFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-44 text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {FISH_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(search || categoryFilter !== 'all') && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-xs">
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No listings found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first fish listing'}
              </p>
              {search || categoryFilter !== 'all' ? (
                <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Listing
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                        Fish Category
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Store
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                        Price
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Created
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="text-right px-4 py-3 w-14">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing: Listing) => (
                      <tr
                        key={listing.id}
                        className="border-b last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                              {listing.coverImage?.url ? (
                                <img
                                  src={listing.coverImage.url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : listing.images?.[0]?.file?.url ? (
                                <img
                                  src={listing.images[0].file.url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Fish className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {listing.title || listing.category?.name || 'Fish'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {stores?.find((s) => s.id === listing.sellerId)?.storeName || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold">
                            {formatCurrency(Number(listing.price))}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(listing.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusBadgeClass(listing.status)}>
                            {statusLabel(listing.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingListing(listing);
                                  setShowForm(true);
                                }}
                              >
                                <Fish className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {listing.status === 'ACTIVE' && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    soldOutMutation.mutate(listing.id);
                                  }}
                                  disabled={soldOutMutation.isPending}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Mark Sold Out
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(listing);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages} ({meta.total} total)
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page <= 1}
                      className="h-8"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={!meta.hasPreviousPage}
                      className="h-8"
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!meta.hasNextPage}
                      className="h-8"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(meta.totalPages)}
                      disabled={page >= meta.totalPages}
                      className="h-8"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ListingFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingListing(null);
        }}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        editListing={editingListing}
        stores={stores ?? []}
      />

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>
                {deleteConfirm?.title || deleteConfirm?.category?.name || 'this listing'}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirm) {
                  deleteMutation.mutate(deleteConfirm.id);
                  setDeleteConfirm(null);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
