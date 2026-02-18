---
name: feedback-notifications
description: >
  Picnic feedback: Banner, Accordion, Tooltip, IconPopover, LoadingIndicator,
  LoadingPlaceholder. Use when showing notifications, collapsible sections,
  tooltips, info popovers, or loading states.
triggers:
  - banner
  - tooltip
  - loading
  - accordion
  - skeleton
---

# User Feedback and Loading States

6 feedback components. `import { Banner, Accordion, Tooltip, IconPopover, LoadingIndicator, LoadingPlaceholder } from '@attentive/picnic'`

## Decision Guide

| Need | Component |
|------|-----------|
| Page/section notification | Banner |
| Collapsible content sections | Accordion |
| Hover/focus info tooltip | Tooltip |
| Icon-triggered info popover | IconPopover |
| Inline loading animation | LoadingIndicator |
| Skeleton placeholder | LoadingPlaceholder |

## Banner

Notification banner with variant-specific default icons. Parses children by type into slots.

props: variant(error|info*|warning|success|neutral|guidance) dismissible(boolean) onDismiss(fn) iconName(IconName, overrides default)
Sub: .Image .Heading .Text .Action

| Variant | Default Icon | Background |
|---------|-------------|-----------|
| neutral | CircleInformation | `$bgDefault` + border |
| info | CircleInformation | `$bgInformationalDefault` |
| success | CircleCheckmark | `$bgSuccessDefault` |
| warning | CircleExclamation | `$bgWarningDefault` |
| error | CircleError | `$bgCriticalDefault` |
| guidance | Lightbulb | `$bgGuidanceDefault` |

| Sub-Component | Non-obvious |
|---------------|-------------|
| .Image | Replaces the default variant icon with custom image |
| .Heading | Renders `Heading variant="sm"`, color auto-set from variant |
| .Action | Right-aligned action area (place Button here) |

## Accordion

Collapsible sections. **`variant` is required** (unusual — most components have defaults).

props: type(single|multiple) !variant(error|info|neutral|warning|decorative3) collapsible(boolean) defaultValue(string|string[]) value(string|string[]) onValueChange(fn)
Sub: .Item(!value) .Header .HeaderIcon .Content

| Sub-Component | Non-obvious |
|---------------|-------------|
| .HeaderIcon | `name(IconName)` — auto-colored by variant |

`collapsible` allows all items closed in single mode (default: one always open).

## Tooltip

**CRITICAL**: `Tooltip.Provider` must wrap your app root (once). Without it, tooltips silently fail.

Follows Radix controlled pattern (see dialog-drawer G4). Non-interactive content (pointer-events disabled).

Sub: .Provider .Trigger .Content
Content: `variant(normal*|danger)` `side(top*|right|bottom|left)`

| Variant | Style |
|---------|-------|
| normal | Dark bg (`$bgTooltip`), white text |
| danger | Red bg (`$bgCriticalDefault`) |

## IconPopover

Convenience wrapper: IconButton + Popover combined. Defaults: `iconName="CircleQuestion"`, `variant="subdued"`, `description="More information"`.

props: iconName(IconName) description(string) side(top*|right|bottom|left) align(start*|center|end) alignOffset(number)

## Loading States

**LoadingIndicator**: Animated dots with built-in screen reader text ("Loading"). Style with `css`. Button's `loading` prop uses it internally.

**LoadingPlaceholder**: Shimmer skeleton. `variant(shimmer*|static)`. Size entirely via `css`:

```tsx
<Stack spacing="$space2">
  <LoadingPlaceholder css={{ width: '100%', height: '$size4' }} />
  <LoadingPlaceholder css={{ width: '80%', height: '$size4' }} />
  <LoadingPlaceholder css={{ width: '60%', height: '$size4' }} />
</Stack>
```

## Canonical Example

```tsx
<Banner variant="error" dismissible onDismiss={clearError}>
  <Banner.Heading>Upload Failed</Banner.Heading>
  <Banner.Text>The file exceeded the maximum size of 10MB.</Banner.Text>
  <Banner.Action>
    <Button variant="secondary" size="small">Retry</Button>
  </Banner.Action>
</Banner>
```

## Common Mistakes Checklist

- Tooltip.Provider MUST wrap app root — tooltips silently fail without it
- Accordion `variant` is required (no default) — omitting it is a build error
- Tooltip content is non-interactive — use Popover for clickable content
- Banner parses children by type — don't wrap sub-components in extra divs
