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

## Forms

The project uses [`react-hook-form`](https://react-hook-form.com/) with
[`zod`](https://zod.dev/) for schema-based validation. Every form goes through
this stack — no ad-hoc `useState` / inline `if (!field) toast.error(...)`.

### Domain models vs. form schemas

Canonical domain schemas live in `models/`, one per resource (`profile.ts`,
`task.ts`, `smartGoal.ts`, `auth.ts`). They mirror the API response shape and
serve as the source of truth for any form that touches that resource.

Form schemas live next to the form (the screen or component file) and are
**derived from the model** via `.pick()` / `.omit()` / `.extend()`. This keeps
form-specific concerns (extra fields, different requiredness) local while
preserving the shared truth in `models/`.

```tsx
// models/task.ts — canonical, shared
export const taskSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().trim().min(1, 'Title is required').max(200),
  // ...
});

// app/addTask/index.tsx — co-located form schema
const addTaskFormSchema = taskSchema.pick({
  title: true,
  description: true,
  priority: true,
  action_category: true,
});
type AddTaskFormValues = z.infer<typeof addTaskFormSchema>;
```

For onboarding-style forms where requiredness differs from the domain model,
use `.extend({...})` to override:

```tsx
const onboardingProfileSchema = profileSchema
  .pick({ first_name: true, last_name: true, /* ... */ })
  .extend({
    first_name: z.string().trim().min(1, 'First name is required').max(100),
    last_name: z.string().trim().min(1, 'Last name is required').max(100),
  });
```

### Wiring up react-hook-form

Inputs in React Native need to be wrapped in `Controller` (`TextInput` is
uncontrolled by RHF's default `register` API):

```tsx
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { control, handleSubmit, formState: { errors, isValid } } =
  useForm<AddTaskFormValues>({
    resolver: zodResolver(addTaskFormSchema),
    mode: 'onTouched',
    defaultValues: { title: '', /* ... */ },
  });

<Controller
  control={control}
  name="title"
  render={({ field: { value, onChange, onBlur } }) => (
    <TextInput
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      testID="add-task-task-name-input"
    />
  )}
/>
{errors.title && (
  <Text testID="add-task-task-name-error">{errors.title.message}</Text>
)}

<PrimaryButton
  onPress={handleSubmit(onSubmit)}
  disabled={!isValid || mutation.isPending}
/>
```

### Conventions

- **Submit disabled while invalid.** Bind the submit button's `disabled` to
  `!isValid` (plus any pending mutation flag). The button still fires the
  resolver on press if somehow reached — `handleSubmit` won't call your
  handler with invalid values.
- **Validation modes.** Use `mode: 'onTouched'` so errors show after a field
  blurs once (not on every keystroke before the user has had a chance).
- **Server errors flow through the toast system.** Don't duplicate
  field-level error rendering for server failures — `apiRequest` already
  surfaces an error toast. Only render inline errors for client-side
  validation. If you genuinely need to render a server error inline, pass
  `silent: true` to the API call to suppress the auto-toast.
- **`testID` on every input and error.** Tests rely on these. Use a
  consistent `<scope>-<field>-input` / `<scope>-<field>-error` pattern.

## Error boundaries

Recoverable error boundaries wrap high-risk screens so an unhandled render
error shows a fallback with a retry CTA instead of a white screen.

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function TaskDetailScreen() {
  const queryClient = useQueryClient();
  return (
    <ErrorBoundary
      scope="task-detail"
      onReset={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
    >
      <TaskDetailContent />
    </ErrorBoundary>
  );
}

function TaskDetailContent() { /* hooks + JSX */ }
```

### What gets wrapped

- Root tab navigator (`app/(tabs)/_layout.tsx`)
- Detail screens that depend on a query that could fail mid-render
  (`app/taskDetail/[id].tsx`, `app/smartGoals/index.tsx`)
- AI-driven flows (`app/onboarding.tsx`, `app/addGoal/index.tsx`) — these
  parse external responses and have more failure surface

### Conventions

- **Extract content into an inner component.** Most screens have multiple
  return paths (loading / error / data). Wrap a single inner component
  rather than every branch.
- **`onReset` should refetch.** When the user taps Retry, reset the
  underlying React Query state with `queryClient.invalidateQueries(...)` so
  the screen actually retries the failed request, not just remounts the
  same broken state.
- **Use `scope` on every boundary.** It's passed to the error reporter
  (`utils/reportError.ts`) for triage.
- **Don't wrap entire trees.** Granular boundaries are more recoverable —
  the ticket guidance is "two taps to recover, not a full app restart".

### Error reporting

`utils/reportError.ts` is a thin Sentry-aware shim. Sentry isn't wired up
yet; the helper currently logs to `console.error` and forwards to a global
`Sentry.captureException` if one is registered. When Sentry is added,
swap the implementation in this one file.
