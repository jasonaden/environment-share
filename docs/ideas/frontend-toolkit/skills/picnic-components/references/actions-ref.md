# Actions Reference

> All components: `import { X } from '@attentive/picnic'`. All accept `css: PicnicCss`.

## Button
Primitive: react-polymorphic-box
props: variant(primary*|secondary|subdued|inverted|legacy-inverted) size(small|medium*|large) loading(boolean)
notes: `basic` variant deprecated → use `secondary`. Supports `as` prop for polymorphic rendering.
deprecated: basic → secondary

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
