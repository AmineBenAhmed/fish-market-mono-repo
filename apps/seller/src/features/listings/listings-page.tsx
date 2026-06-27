import { Button, Input } from '@fishmarket/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpDown,
  ClipboardCopy,
  Fish,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

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
import { Skeleton } from '../../components/ui/skeleton';
import { formatCurrency, formatRelativeTime } from '../../lib/utils';
import { listingsService } from '../../services';
import type { CreateListingData, UpdateListingData } from '../../services/listings.service';
import type { Listing } from '../../types';
import { ListingFormDialog, type ListingFormSubmitData } from './listing-form-dialog';

const ITEMS_PER_PAGE = 15;

function statusBadgeClass(status: string) {
  return status === 'ACTIVE'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : status === 'OUT_OF_STOCK'
      ? 'bg-gray-100 text-gray-500 border-gray-200'
      : status === 'EXPIRED'
        ? 'bg-red-100 text-red-800 border-red-200'
        : 'bg-gray-100 text-gray-700';
}

function statusLabel(status: string) {
  return status === 'OUT_OF_STOCK' ? 'Sold Out' : status.charAt(0) + status.slice(1).toLowerCase();
}

export function ListingsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Listing | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'quantity'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const queryClient = useQueryClient();

  const queryKey = ['seller', 'listings', 'today', { search, page, sortBy, sortOrder }];

  const { data: result, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      listingsService.getToday({
        search: search || undefined,
        page,
        limit: ITEMS_PER_PAGE,
        sortBy,
        sortOrder,
      }),
  });

  const { data: yesterdayListings } = useQuery({
    queryKey: ['seller', 'listings', 'yesterday'],
    queryFn: () => listingsService.getYesterday(),
  });

  const listings = result?.data ?? [];
  const meta = result?.meta;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['seller', 'listings'] });
  }

  const createMutation = useMutation({
    mutationFn: (data: ListingFormSubmitData) =>
      listingsService.create({ ...data, date: new Date().toISOString() } as CreateListingData),
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setEditingListing(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ListingFormSubmitData }) =>
      listingsService.update(id, data as UpdateListingData),
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

  const duplicateMutation = useMutation({
    mutationFn: () => listingsService.duplicateYesterday(),
    onSuccess: () => {
      invalidate();
    },
  });

  function handleSubmit(data: ListingFormSubmitData) {
    if (editingListing) {
      updateMutation.mutate({ id: editingListing.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  function toggleSort(field: 'createdAt' | 'price' | 'quantity') {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }

  function SortHeader({
    field,
    label,
  }: {
    field: 'createdAt' | 'price' | 'quantity';
    label: string;
  }) {
    return (
      <button
        className="flex items-center gap-1 font-medium text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => toggleSort(field)}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    );
  }

  if (isLoading) {
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
          <h2 className="text-xl font-bold">Today's Listings</h2>
          <p className="text-sm text-muted-foreground">Manage your daily fish inventory</p>
        </div>
        <div className="flex items-center gap-2">
          {yesterdayListings && yesterdayListings.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => duplicateMutation.mutate()}
              disabled={duplicateMutation.isPending}
            >
              <ClipboardCopy className="h-4 w-4 mr-1" />
              Copy Yesterday
            </Button>
          )}
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
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-72">
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!listings || listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No listings for today</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first fish listing to start selling
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setEditingListing(null);
                  setShowForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Listing
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground w-12">
                        #
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                        Fish
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                        Category
                      </th>
                      <th className="text-right px-4 py-3">
                        <SortHeader field="price" label="Price" />
                      </th>
                      <th className="text-right px-4 py-3 hidden sm:table-cell">
                        <SortHeader field="quantity" label="Qty" />
                      </th>
                      <th className="text-left px-4 py-3 hidden sm:table-cell font-medium text-xs uppercase tracking-wider text-muted-foreground">
                        Unit
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 hidden lg:table-cell">
                        <SortHeader field="createdAt" label="Created" />
                      </th>
                      <th className="text-right px-4 py-3 w-14">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing, i) => (
                      <tr
                        key={listing.id}
                        className="border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-muted-foreground w-12">
                          {(page - 1) * ITEMS_PER_PAGE + i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                              {listing.coverImage?.url ? (
                                <img
                                  src={listing.coverImage.url}
                                  alt={listing.product?.name ?? ''}
                                  className="h-full w-full object-cover"
                                />
                              ) : listing.images?.[0]?.file?.url ? (
                                <img
                                  src={listing.images[0].file.url}
                                  alt={listing.product?.name ?? ''}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Fish className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {listing.title || listing.product?.name || 'Fish'}
                              </p>
                              {listing.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {listing.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {listing.product?.category?.name ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold">
                            {formatCurrency(Number(listing.price))}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right hidden sm:table-cell">
                          <span
                            className={`text-sm font-medium ${Number(listing.quantity) <= 0 ? 'text-destructive' : ''}`}
                          >
                            {listing.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                          {listing.unit || listing.variant?.unit || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusBadgeClass(listing.status)}>
                            {statusLabel(listing.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                          {formatRelativeTime(listing.createdAt)}
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
                                onClick={() => {
                                  setEditingListing(listing);
                                  setShowForm(true);
                                }}
                              >
                                <Fish className="mr-2 h-4 w-4" />
                                Edit Listing
                              </DropdownMenuItem>
                              {listing.status === 'ACTIVE' && (
                                <DropdownMenuItem
                                  onClick={() => soldOutMutation.mutate(listing.id)}
                                  disabled={soldOutMutation.isPending}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Mark Sold Out
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteConfirm(listing)}
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
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        editListing={editingListing}
      />

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>
                {deleteConfirm?.title || deleteConfirm?.product?.name || 'this listing'}
              </strong>
              ? This action cannot be undone.
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
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
