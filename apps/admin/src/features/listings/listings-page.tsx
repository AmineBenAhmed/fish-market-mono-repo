import { Input } from '@fishmarket/ui';
import { useQuery } from '@tanstack/react-query';
import { List, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '../../components/data-table/data-table';
import { PageHeader } from '../../components/shared/page-header';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { formatDate, statusColor } from '../../lib/utils';
import { listingsService } from '../../services';
import type { Listing } from '../../types';

export function ListingsPage() {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-listings', { storeName, fromDate, toDate, page }],
    queryFn: () =>
      listingsService.getListings({
        storeName: storeName || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
      }),
  });

  useEffect(() => {
    console.log('Listings data:', data);
  }, [data]);

  const listings: Listing[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Listings" description="Manage marketplace listings" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Listings</CardTitle>
          </div>
          <div className="flex gap-4 pt-2">
            <Input
              placeholder="Search by store name..."
              value={storeName}
              onChange={(e) => {
                setStoreName(e.target.value);
                setPage(1);
              }}
              className="max-w-xs"
            />
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
              }}
              className="w-44"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
              }}
              className="w-44"
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: 'title',
                header: 'Listing',
                render: (l: Listing) => (
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{l.title || l.product?.name || '-'}</span>
                  </div>
                ),
              },
              {
                key: 'store',
                header: 'Store',
                render: (l: Listing) => (
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span>{l.seller?.storeName || '-'}</span>
                  </div>
                ),
              },
              {
                key: 'product',
                header: 'Product',
                render: (l: Listing) => (
                  <span className="text-muted-foreground">{l.product?.name || '-'}</span>
                ),
              },
              {
                key: 'price',
                header: 'Price',
                render: (l: Listing) => (
                  <span>
                    {l.price} {l.currency}
                  </span>
                ),
              },
              {
                key: 'quantity',
                header: 'Qty',
                render: (l: Listing) => <span>{l.quantity}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (l: Listing) => <Badge className={statusColor(l.status)}>{l.status}</Badge>,
              },
              {
                key: 'date',
                header: 'Date',
                render: (l: Listing) => formatDate(l.date),
              },
            ]}
            data={listings}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No listings found."
            meta={data?.meta}
            onPageChange={setPage}
            onRowClick={(l: Listing) => navigate(`/listings/${l.id}`)}
            keyExtractor={(l: Listing) => l.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
