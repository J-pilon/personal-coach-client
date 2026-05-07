## Running development build with Metro bundler
IMPORTANT: Until I find another way, use 'npx expo start --tunnel' to connect to the Metro bundler

## Toast notifications

The app surfaces feedback via a global toast system mounted in `app/_layout.tsx`
(`<ToastProvider>`). Use `useToast()` from `components/ToastManager` to show
success, error, and info toasts from any component or hook:

```tsx
import { useToast } from '@/components/ToastManager';

const toast = useToast();
toast.success('Saved');
toast.error('Something went wrong');
toast.info('Coming soon');
```

### Auto-error toasts from the API client

`utils/apiRequest.ts` surfaces an error toast automatically on every non-2xx
response (other than 401, which routes through the auth flow) and on network
errors. Screens generally should not duplicate this in `onError` / `catch`
blocks — let the interceptor do the work.

To suppress the auto-toast — for example, when rendering the error inline —
pass `silent: true`:

```ts
await apiPost('/tasks', { ... }, { silent: true });
```

(`silent` is also accepted by the lower-level `apiRequest` call directly.)

### When to use `Alert.alert` vs `useToast`

- **Use `useToast`** for one-way feedback: validation errors, success messages,
  background failures, info hints.
- **Keep `Alert.alert`** only for true confirmation dialogs — anything that
  needs the user to choose between actions (Cancel / Delete, Continue / Discard,
  etc.). Toasts intentionally don't carry buttons.
