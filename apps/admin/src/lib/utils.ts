export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(date);
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    PENDING: 'bg-gray-100 text-gray-800',
    APPROVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-gray-900 text-gray-50',
    ONLINE: 'bg-emerald-100 text-emerald-800',
    OFFLINE: 'bg-gray-100 text-gray-800',
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_ASSIGNMENT: 'bg-amber-100 text-amber-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-indigo-100 text-indigo-800',
    PICKING_UP: 'bg-cyan-100 text-cyan-800',
    PICKED_UP: 'bg-teal-100 text-teal-800',
    IN_TRANSIT: 'bg-blue-100 text-blue-800',
    OUT_FOR_DELIVERY: 'bg-blue-100 text-blue-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    CONFIRMED: 'bg-emerald-100 text-emerald-800',
    READY_FOR_PICKUP: 'bg-purple-100 text-purple-800',
    REFUNDED: 'bg-rose-100 text-rose-800',
    PARTIALLY_REFUNDED: 'bg-rose-50 text-rose-700',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
