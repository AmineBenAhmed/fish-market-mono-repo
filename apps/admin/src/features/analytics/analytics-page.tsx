import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CreditCard,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { PageHeader } from '../../components/shared/page-header';
import { StatCard } from '../../components/shared/stat-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { analyticsService } from '../../services';

function formatTND(value?: number | null) {
  if (value == null || isNaN(value)) return '- TND';
  return `${value.toLocaleString()} TND`;
}

function CustomTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <p className="mb-1 text-sm font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-72 items-center justify-center">
      <Skeleton className="h-full w-full" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function AnalyticsPage() {
  const today = toDateInputValue(new Date());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const dateParams = startDate && endDate ? { startDate, endDate } : undefined;

  const results = useQueries({
    queries: [
      {
        queryKey: ['analytics', 'summary', dateParams],
        queryFn: () => analyticsService.getSummary(dateParams),
      },
      {
        queryKey: ['analytics', 'revenue-trends', dateParams],
        queryFn: () => analyticsService.getRevenueTrends(12, dateParams),
      },
      {
        queryKey: ['analytics', 'order-trends', dateParams],
        queryFn: () => analyticsService.getOrderTrends(12, dateParams),
      },
      {
        queryKey: ['analytics', 'user-growth', dateParams],
        queryFn: () => analyticsService.getUserGrowth(12, dateParams),
      },
      {
        queryKey: ['analytics', 'seller-growth', dateParams],
        queryFn: () => analyticsService.getSellerGrowth(12, dateParams),
      },
    ],
  });

  const [summary, revenueTrends, orderTrends, userGrowth, sellerGrowth] = results;

  const hasCustomRange = !!dateParams;

  const periodLabel = hasCustomRange ? `${startDate} to ${endDate}` : 'today';

  const monthLabel = hasCustomRange ? `${startDate} to ${endDate}` : 'this month';

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Marketplace performance insights" />

      <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">From</label>
          <input
            type="date"
            value={startDate}
            max={endDate || today}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">To</label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            max={today}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border px-3 py-1.5 text-sm"
          />
        </div>
        {hasCustomRange && (
          <button
            onClick={clearDates}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Clear
          </button>
        )}
      </div>

      {summary.isError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          Failed to load summary data
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summary.isPending ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={formatTND(summary.data?.totalRevenue)}
              icon={CreditCard}
              description={
                summary.data ? `${formatTND(summary.data.periodRevenue)} ${periodLabel}` : undefined
              }
            />
            <StatCard
              title="Total Orders"
              value={summary.data?.totalOrders ?? '-'}
              icon={ShoppingCart}
              description={summary.data ? `${summary.data.periodOrders} ${periodLabel}` : undefined}
            />
            <StatCard
              title="Total Customers"
              value={summary.data?.totalUsers ?? '-'}
              icon={Users}
              description={summary.data ? `${summary.data.periodUsers} ${monthLabel}` : undefined}
            />
            <StatCard
              title="Total Sellers"
              value={summary.data?.totalSellers ?? '-'}
              icon={Store}
              description={summary.data ? `${summary.data.periodSellers} ${monthLabel}` : undefined}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Revenue Trends</CardTitle>
            </div>
            <CardDescription>Monthly revenue (commission + delivery fees)</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueTrends.isPending ? (
              <ChartSkeleton />
            ) : revenueTrends.isError ? (
              <p className="text-sm text-destructive">Failed to load revenue data</p>
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <BarChart data={revenueTrends.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}`} />
                  <Tooltip content={<CustomTooltip formatter={formatTND} />} />
                  <Legend />
                  <Bar
                    dataKey="commissionRevenue"
                    name="Commission"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="deliveryRevenue"
                    name="Delivery (net)"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Order Trends</CardTitle>
            </div>
            <CardDescription>Monthly order volume</CardDescription>
          </CardHeader>
          <CardContent>
            {orderTrends.isPending ? (
              <ChartSkeleton />
            ) : orderTrends.isError ? (
              <p className="text-sm text-destructive">Failed to load order data</p>
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <BarChart data={orderTrends.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">User Growth</CardTitle>
            </div>
            <CardDescription>New customer registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            {userGrowth.isPending ? (
              <ChartSkeleton />
            ) : userGrowth.isError ? (
              <p className="text-sm text-destructive">Failed to load user data</p>
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <LineChart data={userGrowth.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="New Customers"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Seller Growth</CardTitle>
            </div>
            <CardDescription>New seller registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {sellerGrowth.isPending ? (
              <ChartSkeleton />
            ) : sellerGrowth.isError ? (
              <p className="text-sm text-destructive">Failed to load seller data</p>
            ) : (
              <ResponsiveContainer width="100%" height={288}>
                <LineChart data={sellerGrowth.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="New Sellers"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
