type ErrorContext = Record<string, unknown>;

export function reportError(error: unknown, context?: ErrorContext) {
  console.error('[reportError]', error, context);

  const sentry = (globalThis as { Sentry?: { captureException?: (err: unknown, ctx?: unknown) => void } }).Sentry;
  if (sentry?.captureException) {
    try {
      sentry.captureException(error, context ? { extra: context } : undefined);
    } catch (e) {
      console.error('[reportError] Sentry capture failed', e);
    }
  }
}
