const CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'maintenant';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}j`;
  return then.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

export function deliveryStepFromStatus(status: string): number {
  const steps: Record<string, number> = {
    ASSIGNED: 0,
    ACCEPTED: 1,
    PICKING_UP: 2,
    PICKED_UP: 3,
    IN_TRANSIT: 4,
    DELIVERED: 5,
  };
  return steps[status] ?? -1;
}

export function deliveryActionLabel(action: string): string {
  const labels: Record<string, string> = {
    accept: 'Accepter la Livraison',
    arrive: 'Arrivé chez le Vendeur',
    pickup: 'Collecter la Commande',
    transit: 'Partir pour Livraison',
    complete: 'Confirmer la Livraison',
  };
  return labels[action] ?? action;
}

export function deliveryActionIcon(action: string): string {
  const icons: Record<string, string> = {
    accept: '✅',
    arrive: '📍',
    pickup: '📦',
    transit: '🚗',
    complete: '✓',
  };
  return icons[action] ?? '→';
}
