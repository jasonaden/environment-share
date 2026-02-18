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
