# Loading Components

A comprehensive set of loading components designed to provide consistent loading states across the Personal Coach app, following the design brief with gradient styling and smooth animations.

## Components

### LoadingSpinner

A versatile loading spinner with multiple variants and sizes.

```tsx
import { LoadingSpinner } from '@/components/loading';

// Basic usage
<LoadingSpinner />

// With custom text and size
<LoadingSpinner 
  size="large" 
  text="Loading tasks..." 
  variant="fullscreen" 
/>

// Inline variant for buttons/forms
<LoadingSpinner 
  size="small" 
  variant="inline" 
  text="Saving..." 
/>
```

**Props:**
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `text`: Optional text below the spinner
- `variant`: 'default' | 'card' | 'fullscreen' | 'inline'
- `showBackground`: Whether to show a background
- `backgroundColor`: Custom background color
- `pulse`: Whether to show pulsing animation (default: true)
- `testID`: Custom test ID for testing

**Variants:**
- `default`: Simple centered spinner
- `card`: Glassmorphism card with backdrop blur
- `fullscreen`: Full screen with gradient background
- `inline`: Minimal inline spinner for buttons/forms

### LoadingSkeleton

Skeleton loading states for content areas.

```tsx
import { LoadingSkeleton } from '@/components/loading';

// Text skeleton
<LoadingSkeleton 
  type="text" 
  count={3} 
  height={20} 
/>

// Card skeleton
<LoadingSkeleton 
  type="card" 
  count={2} 
  height={24} 
/>

// List skeleton
<LoadingSkeleton 
  type="list" 
  count={5} 
  height={18} 
/>

// Avatar skeleton
<LoadingSkeleton 
  type="avatar" 
  count={1} 
  height={20} 
/>

// Button skeleton
<LoadingSkeleton 
  type="button" 
  count={2} 
  height={48} 
/>
```

**Props:**
- `type`: 'text' | 'card' | 'list' | 'avatar' | 'button'
- `count`: Number of skeleton items to show
- `height`: Height of skeleton items
- `width`: Width (percentage or fixed value)
- `rounded`: Whether to show rounded corners
- `testID`: Custom test ID for testing

### LoadingOverlay

Modal-like loading overlay with progress support.

```tsx
import { LoadingOverlay } from '@/components/loading';

// Basic overlay
<LoadingOverlay 
  visible={isLoading} 
  text="Processing your request..." 
/>

// With progress
<LoadingOverlay 
  visible={isProcessing} 
  text="Generating SMART goals..." 
  subtitle="This may take a few moments"
  showProgress={true}
  progress={75}
/>

// Dismissible overlay
<LoadingOverlay 
  visible={showOverlay} 
  text="Loading..." 
  dismissible={true}
  onClose={() => setShowOverlay(false)}
/>
```

**Props:**
- `visible`: Whether the overlay is visible
- `text`: Main text to display
- `subtitle`: Optional subtitle text
- `showCloseButton`: Whether to show close button
- `onClose`: Callback when close button is pressed
- `showProgress`: Whether to show progress bar
- `progress`: Progress value (0-100)
- `dismissible`: Whether tapping outside dismisses
- `testID`: Custom test ID for testing

## Usage Examples

### Screen Loading States

```tsx
// Fullscreen loading for initial data fetch
if (isLoading) {
  return (
    <LinearGradient>
      <LoadingSpinner
        size="large"
        text="Loading tasks..."
        variant="fullscreen"
        testID="screen-loading"
      />
    </LinearGradient>
  );
}
```

### Inline Loading States

```tsx
// Button loading state
<PrimaryButton
  title="Save"
  onPress={handleSave}
  isLoading={isSaving}
  loadingText="Saving..."
/>

// Form loading state
{isSubmitting && (
  <LoadingSpinner
    size="small"
    text="Submitting..."
    variant="inline"
    testID="form-loading"
  />
)}
```

### Skeleton Loading

```tsx
// Content skeleton while loading
{isLoading ? (
  <LoadingSkeleton
    type="card"
    count={3}
    height={24}
    testID="content-skeleton"
  />
) : (
  <ActualContent />
)}
```

### Progress Overlays

```tsx
// AI processing with progress
<LoadingOverlay
  visible={isAiProcessing}
  text="Generating your SMART goals..."
  subtitle="Analyzing your input and creating actionable objectives"
  showProgress={true}
  progress={aiProgress}
  testID="ai-processing-overlay"
/>
```

## Best Practices

1. **Use appropriate variants**: Use `fullscreen` for screen-level loading, `card` for content areas, and `inline` for buttons/forms.

2. **Provide meaningful text**: Always include descriptive text that explains what's happening.

3. **Use skeletons for content**: Use `LoadingSkeleton` for content areas to maintain layout and reduce perceived loading time.

4. **Progress for long operations**: Use `LoadingOverlay` with progress for operations that take more than a few seconds.

5. **Consistent sizing**: Use `large` for fullscreen, `medium` for cards, and `small` for inline elements.

6. **Test IDs**: Always provide test IDs for automated testing.

## Design System Integration

All loading components follow the design brief:
- **Colors**: Use the brand color palette (#33CFFF, #2B42B6, #F1F5F9, etc.)
- **Gradients**: Integrate with LinearGradient for backgrounds
- **Typography**: Follow the established text hierarchy
- **Animations**: Smooth, subtle animations that enhance UX
- **Spacing**: Consistent with the app's spacing system
- **Shadows**: Subtle elevation effects for depth

## Accessibility

- All components support screen readers with proper test IDs
- Loading states are clearly communicated through text
- Progress indicators provide visual feedback for long operations
- Dismissible overlays support keyboard navigation
