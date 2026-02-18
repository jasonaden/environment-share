---
name: dialog-drawer
description: >
  Picnic overlays: StandardDialog, Dialog, StandardDrawer, Drawer, Popover,
  DropdownMenu. Use when showing modals, slide-in panels, floating content,
  or action menus.
triggers:
  - modal
  - dialog
  - drawer
  - popover
  - dropdown menu
---

# Overlays, Modals, and Popovers

6 overlay components. `import { StandardDialog, Dialog, Drawer, StandardDrawer, Popover, DropdownMenu } from '@attentive/picnic'`

## Radix Controlled Pattern (G4)

All overlay components follow the same pattern: `open(boolean)` `defaultOpen(boolean)` `onOpenChange((open: boolean) => void)`. Omit for uncontrolled (trigger-driven). This applies to: Dialog, StandardDialog, Drawer, StandardDrawer, Popover, Tooltip, DropdownMenu.

## Decision Guide

| Need | Component |
|------|-----------|
| Structured modal (header/body/footer) | StandardDialog |
| Custom modal layout | Dialog |
| Structured side panel | StandardDrawer |
| Custom side panel | Drawer |
| Floating info/guidance content | Popover |
| Action menu with items | DropdownMenu |

## StandardDialog

Pre-structured modal with slot-based layout. Prefer over Dialog for standard use cases.

Sub: .Trigger .Content .Header .Heading .HeroImage .Body .Footer .Close

| Sub-Component | Non-obvious |
|---------------|-------------|
| .Heading | Renders `Heading variant="md"` automatically |
| .HeroImage | Triggers 16:9 image layout variant; accepts ResponsiveImage props |
| .Body | Scrollable content area |
| .Footer | Uses ButtonBar internally; `layout(auto*\|stretch)` |
| .Close | Renders Button; defaults suitable for cancel actions |

## Dialog

Low-level modal. Use for fully custom layouts.

Sub: .Trigger .Content .Header .Close .CloseButton

Content: `styling(default*|unstyled)` — unstyled removes all defaults. `portalContainer` for custom portal target.
CloseButton: positioned top-right by default.

## StandardDrawer

Slide-in panel (right side) with slot-based layout.

Sub: .Trigger .Content .Header .Body .Footer .Close

| Sub-Component | Non-obvious |
|---------------|-------------|
| .Footer | `layout="auto"` by default |
| .Close | `variant="subdued"` by default |

## Drawer

Low-level slide-in panel. `onCloseFinish` fires after 300ms close animation. `includeOverlay(boolean, default true)`.

Sub: .Trigger .Content .Header .CloseButton

## Popover

Floating content panel anchored to trigger.

Sub: .Trigger .Anchor .Content .CloseButton .CloseIconButton

props: variant(default*|guidance)

| Variant | Style |
|---------|-------|
| default | White bg, border, white arrow |
| guidance | Purple bg (`$lavenderPurple700`), inverted text, purple arrow |

Content: `showCloseButton(true*)` `showArrow(true*)` `side(top|right|bottom|left)` `align(start|center|end)` `alignOffset(number, default 4)`

## DropdownMenu

Action menu with keyboard navigation and sub-menus.

Sub: .Trigger .Button .Content .Item .TextItem .Label .Separator .Sub .SubMenuTriggerItem .SubContent .UnstyledItem

| Sub-Component | Non-obvious |
|---------------|-------------|
| .Button | Pre-styled trigger with chevron icon |
| .Label | Non-interactive group heading |
| .Sub + .SubMenuTriggerItem + .SubContent | Nested sub-menu pattern |

## Canonical Example

```tsx
<StandardDialog open={isOpen} onOpenChange={setIsOpen}>
  <StandardDialog.Trigger>
    <Button>Create Campaign</Button>
  </StandardDialog.Trigger>
  <StandardDialog.Content css={{ width: '500px' }}>
    <StandardDialog.Header>
      <StandardDialog.Heading>Create Campaign</StandardDialog.Heading>
    </StandardDialog.Header>
    <StandardDialog.Body>
      <Form initialValues={{ name: '' }} onSubmit={handleCreate} validationSchema={schema}>
        <Stack spacing="$space4">
          <Form.FormField>
            <Form.Label requirement="required">Campaign Name</Form.Label>
            <Form.TextInput name="name" />
            <Form.ErrorText name="name" />
          </Form.FormField>
        </Stack>
        <StandardDialog.Footer>
          <StandardDialog.Close variant="secondary">Cancel</StandardDialog.Close>
          <Form.SubmitButton>Create</Form.SubmitButton>
        </StandardDialog.Footer>
      </Form>
    </StandardDialog.Body>
  </StandardDialog.Content>
</StandardDialog>
```

## Common Mistakes Checklist

- Trigger children must accept a ref and forward props (Radix `asChild` pattern)
- All overlays portal to `document.body` by default — use `portalContainer` to override
- Dialog/Drawer trap focus automatically — do not add manual focus management
- DropdownMenu.Trigger wraps child with `asChild`; use `.Button` for pre-styled option
