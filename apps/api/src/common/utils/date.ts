export function now(): string {
  return new Date().toISOString();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function isExpired(date: Date): boolean {
  return new Date() > date;
}

export function toISOString(date: Date): string {
  return date.toISOString();
}
