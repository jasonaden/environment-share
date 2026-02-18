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
