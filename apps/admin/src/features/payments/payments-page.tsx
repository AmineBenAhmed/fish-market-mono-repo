import { useQuery } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { useState } from 'react';

import { DataTable } from '../../components/data-table/data-table';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { formatCurrency, formatDate, statusColor } from '../../lib/utils';
import { paymentsService } from '../../services';
import type { Payment } from '../../types';

export function PaymentsPage() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['payments', { status, page }],
    queryFn: () =>
      paymentsService.getPayments({ status: status !== 'all' ? status : undefined, page }),
  });

  const payments: Payment[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        <p className="text-muted-foreground">Monitor payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Payments</CardTitle>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="DECLINED">Declined</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
                <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: 'id',
                header: 'Payment ID',
                render: (p: Payment) => (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs">{p.id.slice(0, 8)}</span>
                  </div>
                ),
              },
              {
                key: 'order',
                header: 'Order',
                render: (p: Payment) => p.order?.orderNumber || p.orderId.slice(0, 8),
              },
              {
                key: 'method',
                header: 'Method',
                render: (p: Payment) => p.method.replace(/_/g, ' '),
              },
              {
                key: 'amount',
                header: 'Amount',
                render: (p: Payment) => formatCurrency(Number(p.amount)),
              },
              {
                key: 'status',
                header: 'Status',
                render: (p: Payment) => (
                  <Badge className={statusColor(p.status)}>{p.status.replace(/_/g, ' ')}</Badge>
                ),
              },
              { key: 'createdAt', header: 'Date', render: (p: Payment) => formatDate(p.createdAt) },
            ]}
            data={payments}
            isLoading={isLoading}
            error={error as Error | null}
            emptyMessage="No payments found."
            meta={data?.meta}
            onPageChange={setPage}
            keyExtractor={(p: Payment) => p.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
