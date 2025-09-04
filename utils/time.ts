export function msToIso(updated_at_ms: number): string {
  return new Date(updated_at_ms).toISOString();
}

export function isoToMs(iso: string): number {
  return Date.parse(iso);
}

export function nowMs(): number {
  return Date.now();
}