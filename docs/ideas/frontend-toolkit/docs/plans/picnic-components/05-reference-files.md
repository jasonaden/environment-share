# 5. Reference Files

4 categorized reference files provide pure lookup tables for standalone components. No examples, no variant style tables, no "Related Components" sections.

---

## 5.1 actions-ref.md

Target: ~27 lines / ~1.2KB (87% reduction from ~9KB)

Components: Button, IconButton, ButtonBar, ButtonGroup, ButtonGroupNext, PickerButton

```markdown
# Actions Reference

> All components: `import { X } from '@attentive/picnic'`. All accept `css: PicnicCss`.

## Button
Primitive: react-polymorphic-box
props: variant(primary*|secondary|subdued|inverted|legacy-inverted) size(small|medium*|large) loading(boolean)
notes: `basic` variant deprecated -> use `secondary`. Supports `as` prop for polymorphic rendering.
deprecated: basic -> secondary

## IconButton
Primitive: react-polymorphic-box
props: !iconName(IconName) !description(string) variant(basic*|primary|secondary|subdued|inverted) size(extraSmall|small|medium*|large) iconColor(IconColor) loading(boolean)

## ButtonBar
Primitive: styled div
props: layout(auto*|stretch)

## ButtonGroup
Primitive: styled div + Context
Sub: .Item .IconItem
props: activeItem(string|null)
Item: !name(string)
IconItem: !name(IconName) !description(string)

## ButtonGroupNext
Primitive: styled div + Context
Sub: .Item .IconItem
props: activeItem(string|null)
Item: !name(string)
IconItem: !name(IconName) !description(string)
notes: Updated API replacing ButtonGroup. Same compound pattern.

## PickerButton
Primitive: styled button
props: size(small|medium*) state(normal*|error)
notes: Trigger button for date pickers and selects. Shows chevron indicator.
```

---

## 5.2 typography-ref.md

Target: ~17 lines / ~0.8KB (85% reduction from ~5.5KB)

Components: Heading, Text, TextWithOverflowTooltip, Link

```markdown
# Typography Reference

> All components: `import { X } from '@attentive/picnic'`. All accept `css: PicnicCss`.

## Heading
Primitive: styled polymorphic heading
props: variant(page|xl|lg*|md|sm|subheading) color(default*|subdued|inverted|success|warning|critical|info|guidance|neutral) as(h1|h2*|h3|h4|h5|h6)
notes: `variant` controls visual size; `as` controls semantic level independently.

## Text
Primitive: styled span (polymorphic)
props: variant(lede|body*|caption|micro) color(default*|subdued|inverted|success|warning|critical|info|guidance|neutral|decorative1|decorative2|decorative3|decorative4)

## TextWithOverflowTooltip
Primitive: Text + Tooltip composition
Sub: .Trigger .TextItem .Content .TooltipText
notes: Shows tooltip automatically when text overflows container. Requires full compound structure.

## Link
Primitive: styled a (react-polymorphic-box)
props: variant(default*|inverted)
notes: Supports `as` prop for routing libraries (e.g., React Router Link).
```

---

## 5.3 data-display-ref.md

Target: ~19 lines / ~0.9KB (87% reduction from ~7KB)

Components: Badge, Tag, ContainedLabel, ProgressBar, List, Card

```markdown
# Data Display Reference

> All components: `import { X } from '@attentive/picnic'`. All accept `css: PicnicCss`.

## Badge
Primitive: styled em
props: variant(active|standard*|primary|error|magic) position(inline|raised*)
notes: NO `secondary` variant. Use `standard` for default, `primary` for brand emphasis.

## Tag
Primitive: styled span
props: !onDelete(fn) size(small|normal*) variant(default*|error)

## ContainedLabel
Primitive: styled div + Context
Sub: .Icon .Tooltip
props: variant(neutral*|success|informational|warning|critical|decorative1|decorative2|decorative3|decorative4|overMedia|magic)
Icon: !name(IconName) color(IconColor)
Tooltip: !iconName(IconName) iconColor(IconColor) !description(string) side(top|right|bottom|left)

## ProgressBar
Primitive: Radix Progress
props: !total(number) !value(number) variant(success*|warning|error)

## List
Primitive: styled ul/ol
Sub: .Item
props: as(ul*|ol) variant(unstyled)

## Card
Primitive: styled div
props: interactive(boolean) active(boolean)
notes: `interactive` enables hover lift/shadow. `active` shows selected border.
```

---

## 5.4 media-ref.md

Target: ~25 lines / ~1.1KB (87% reduction from ~8.5KB)

Components: Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, ResponsiveImage, ImagePreview, Logomark, Wordmark, Emoji

```markdown
# Media & Branding Reference

> All components: `import { X } from '@attentive/picnic'`. All accept `css: PicnicCss`.

## Icon
Primitive: SVG
props: !name(IconName) mode(decorative*|presentational) size(extraSmall|small|medium*|large) color(IconColor)
notes: Discriminated union — `mode="presentational"` requires `description` prop.

## ThirdPartyIcon
Primitive: SVG
props: !name(ThirdPartyIconName) mode(decorative*|presentational) size(extraSmall|small|medium*|large) color(IconColor)
notes: Same discriminated union as Icon.

## IconCircle
Primitive: styled div + Icon
props: !iconName(IconName) size(extraSmall|small|medium*|large) color(default*|inverted|brand|success|warning|critical|decorative1|decorative2|decorative3|decorative4|disabled|magic)

## ThirdPartyIconCircle
Primitive: styled div + ThirdPartyIcon
props: !iconName(ThirdPartyIconName) size(extraSmall|small|medium*|large) color(default*|inverted)

## ResponsiveImage
Primitive: Radix AspectRatio
props: ratio(number) as(img*|video) src(string) alt(string)

## ImagePreview
Primitive: custom (img + loading + remove button)
props: !src(string|null) !altText(string) size(small|medium|large*) onRemove(fn)

## Logomark
Primitive: SVG (memoized)
props: title(string) variant(LogoVariant)

## Wordmark
Primitive: SVG (memoized)
props: title(string) color(PicnicColorsToken|inherit*)

## Emoji
Primitive: styled span
props: !label(string) decorational(boolean)
notes: Renders `role="img"` with `aria-label`. `decorational` hides from screen readers.
```

---

## 5.5 Compression Summary

| File | Components | Est. Lines | Est. Size | vs. Current |
|------|-----------|-----------|-----------|-------------|
| actions-ref.md | 6 | ~27 | ~1.2KB | 87% reduction |
| typography-ref.md | 4 | ~17 | ~0.8KB | 85% reduction |
| data-display-ref.md | 6 | ~19 | ~0.9KB | 87% reduction |
| media-ref.md | 9 | ~25 | ~1.1KB | 87% reduction |
| **Total** | **25** | **~88** | **~4KB** | **87% avg reduction** |

All 25 reference-only components covered. Each file follows the compact entry format from the style guide (Section 2). Zero examples, zero variant style tables, zero "Related Components" sections.
