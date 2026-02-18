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
