# Design Token Tables

> Compact lookup for all ~97 functional tokens + scales. For rules and decision guides, see the design-tokens skill.

## Raw Palette (theme creation only — never in component code)

Grayscale: 0 #FFF · 030 #FAFAFA · 100 #EFF0F0 · 200 #E2E3E3 · 300 #C6C7C8 · 400 #B6B7B8 · 600 #8D8F91 · 700 #656567 · 800 #545759 · 900 #1B1F23 · 1000 #000
  Opacity variants: 200_40 · 800_40 · 900_08/12/16/24/40 · 1000_50

Yellow: 100 #FFFDE5 · 200 #FFF8B3 · 300 #FFF382 · 300_40 rgba(255,243,130,.4) · 500 #FADF65 · 600 #FFE600 · 700 #F9D100
Green: 100 #D8EFE4 · 200 #9FD6BC · 700 #3AA372 · 800 #30855D · 900 #1F573D
Red: 100 #FFD7DE · 200 #FF9CAC · 300 #FA7F8F · 700 #ED3553 · 800 #B3283E
CreamsicleOrange: 100 #FFE1A9 · 200 #FBCD81 · 300 #FABF61
AperolOrange: 100 #FFD4BF · 200 #FFA175 · 700 #E04800 · 800 #AD3800
HyperlinkBlue: 200 #94C7FA · 300 #6FB2F9 · 700 #0074E0 · 800 #005AAD
CeleryGreen: 100 #E2FA9F · 200 #BDD185 · 700 #788554 · 800 #617030
CloudBlue: 100 #E3F0F4 · 200 #82C8D2 · 700 #55838A · 800 #2A4A50
CloveBrown: 100 #F9F7F0 · 200 #D1BAB0 · 300 #C1A396 · 700 #AD6848 · 800 #7F2801
LavenderPurple: 030 #FBF3FF · 100 #EDC6ED · 200 #C878D1 · 700 #834F8A · 800 #58495B
SteelBlue: 100 #E7F2FE · 200 #CEE5FD · 300 #B9CEE4 · 700 #67737E · 800 #3E454C

## $bg — Surfaces

$bgDefault #FFF →dark #1B1F23
$bgAccentSubtle #FAFAFA
$bgAccent #EFF0F0 (cards, sections)
$bgAccentDark #E2E3E3
$bgPlaceholder #E2E3E3 (skeleton states)
$bgPlaceholderAlt #C6C7C8
$bgOverlay rgba(0,0,0,.5) (modal backdrop)
$bgTooltip #000
$bgBrand #FFF382 →dark rgba(255,243,130,.4)
$bgInverted #1B1F23
$bgInvertedDisabled #8D8F91
$bgHighlighted #CEE5FD (search highlight)

## $bg — State Progressions (Default → Hover → Pressed → Disabled)

Primary action: $bgActionPrimary #FFF382 → Hover #FFE600 → Pressed #F9D100 → Disabled rgba(255,243,130,.4)
Secondary action: $bgActionSecondary #E2E3E3 → Hover #C6C7C8 → Pressed #8D8F91 → Disabled rgba(226,227,227,.4)
Basic action: $bgActionBasic #FFF →dark #1B1F23 → Hover #EFF0F0 → Pressed #E2E3E3
Row: $bgRow #FFF →dark #1B1F23 → Hover #EFF0F0 →dark #545759 → Pressed #E2E3E3 →dark #656567 | Selected #E2E3E3 →dark #656567 → SelectedHover #E2E3E3 → SelectedPressed #C6C7C8
Toggle: $bgToggleDefault #FFF → Hover #E2E3E3 → Pressed #C6C7C8 → Selected #1B1F23

## $bg — Semantic Status

$bgSuccessDefault #D8EFE4 · $bgSuccessAccent #9FD6BC
$bgCriticalDefault #FFD7DE · $bgCriticalAccent #FF9CAC
$bgWarningDefault #FFE1A9 →dark #E04800 · $bgWarningAccent #FFA175 →dark #AD3800
$bgInformationalDefault #F9F7F0 →dark #7F2801 · $bgInformationalAccent #D1BAB0
$bgGuidanceDefault #FBF3FF · $bgGuidanceAccent #834F8A

## $bg — Decorative

Set 1 (celery): $bgDecorative1Default #E2FA9F · Accent #BDD185
Set 2 (cloud): $bgDecorative2Default #E3F0F4 · Accent #82C8D2
Set 3 (steel): $bgDecorative3Default #E7F2FE · Accent #CEE5FD
Set 4 (lavender): $bgDecorative4Default #EDC6ED · Accent #C878D1

Gradients: $bgGradientMagic linear-gradient(90deg, lavender → steel) · $bgGradientMagicFallback #EDC6ED

## $text — Text Colors

$textDefault #1B1F23 →dark #FFF
$textSubdued #656567
$textDisabled rgba(27,31,35,.4)
$textInverted #FFF →dark #1B1F23
$textLink #1B1F23 →dark #FFF
$textHover #0074E0
$textPressed #005AAD
$textSelectedToggle #1B1F23
$textSuccess #30855D
$textWarning #AD3800
$textCritical #B3283E
$textInformational #7F2801
$textDecorative1 #617030 · 2 #2A4A50 · 3 #3E454C · 4 #58495B

## $icon — Icon Colors

$iconDefault #1B1F23
$iconSubdued #8D8F91
$iconDisabled rgba(27,31,35,.4)
$iconInverted #FFF
$iconHovered #0074E0
$iconPressed #005AAD
$iconSuccess #3AA372
$iconWarning #E04800
$iconCritical #ED3553
$iconInfo #AD6848
$iconGuidance #834F8A
$iconDecorative1 #788554 · 2 #55838A · 3 #67737E · 4 #834F8A

## $border — Border Colors

$borderDefault #E2E3E3
$borderLoud #C6C7C8
$borderVisualization #8D8F91
$borderInverted #FFF
$borderInput #545759 → Hover #000 → Success #3AA372 → Error #ED3553 → Disabled rgba(84,87,89,.4)
$borderActionBasic #C6C7C8 · Disabled rgba(84,87,89,.4)
$borderFocus #1B1F23
$borderSelectedToggle #000

## Dark Theme Overrides (~13 tokens that change)

$bgDefault #FFF→#1B1F23 · $bgActionBasic #FFF→#1B1F23 · $bgBrand #FFF382→rgba(255,243,130,.4)
$bgRow #FFF→#1B1F23 · $bgRowHover #EFF0F0→#545759 · $bgRowSelected/#Pressed #E2E3E3→#656567
$bgWarningDefault #FFE1A9→#E04800 · $bgWarningAccent #FFA175→#AD3800
$bgInformationalDefault #F9F7F0→#7F2801
$textDefault #1B1F23→#FFF · $textInverted #FFF→#1B1F23 · $textLink #1B1F23→#FFF

## Space Scale (4px grid)

$space0(0) · 1(4) · 2(8) · 3(12) · 4(16) · 5(20) · 6(24) · 7(28) · 8(32) · 9(36) · 10(40) · 11(44) · 12(48) · 13(52) · 14(56) · 15(60) · 16(64px)

Size scale: identical values ($size0–$size16). Also $bp1(640) $bp2(768) $bp3(1024) $bp4(1280) for max-width.

## Typography

Fonts: $display (Ginto Nord) · $body (Ginto Normal)
Sizes: $fontSize1(12px/.75rem) · 2(14px/.875rem) · 3(16px/1rem) · 4(20px/1.25rem) · 5(24px/1.5rem) · 6(28px/1.75rem) · 7(32px/2rem)
Weights: $regular(400) · $bold(500) — no others exist
Line heights: $lineHeight1(1) · 2(1.25) · 3(1.285) · 4(1.333) · 5(1.4) · 6(1.428) · 7(1.5)
Letter spacing: $letterSpacing0(0) · 1(0.3px, global default) · 2(0.5px)

### Heading variant → token

| Variant | fontSize | lineHeight |
|---------|----------|------------|
| page | $fontSize7 (32px) | $lineHeight1 (1) |
| xl | $fontSize6 (28px) | $lineHeight1 (1) |
| lg | $fontSize5 (24px) | $lineHeight1 (1) |
| md | $fontSize4 (20px) | $lineHeight2 (1.25) |
| sm | $fontSize3 (16px) | $lineHeight2 (1.25) |
| subheading | $fontSize1 (12px) | $lineHeight2 (1.25) |

All Heading variants use $display font + $bold weight.

### Text variant → token

| Variant | fontSize | lineHeight |
|---------|----------|------------|
| lede | $fontSize4 (20px) | $lineHeight5 (1.4) |
| body* | $fontSize3 (16px) | $lineHeight5 (1.4) |
| caption | $fontSize2 (14px) | $lineHeight5 (1.4) |
| micro | $fontSize1 (12px) | $lineHeight5 (1.4) |

All Text variants use $body font + $regular weight.

### Typography color prop → token

default→$textDefault · subdued→$textSubdued · inverted→$textInverted · success→$textSuccess · warning→$textWarning · critical→$textCritical · info→$textInformational · decorative1-4→$textDecorative1-4

## Radii

$radius1(4px) · $radius2(8px) · $radius3(16px) · $radiusMax(9999px/pill)

## Border Widths

$borderWidth0(0) · $borderWidth1(1px) · $borderWidth2(2px) · $borderWidth3(4px)

## Shadows

$focus: 0 0 0 2px bgDefault, 0 0 0 4px borderFocus (double ring — buttons/cards)
$inputFocus: 0 0 0 1px borderFocus (single ring — form inputs)
$shadow1: 4px/12px 8% opacity (subtle lift)
$shadow2: 4px/16px 12% (cards, dropdowns)
$shadow3: 6px/20px 16% (popovers)
$shadow4: 10px/25px 24% (dialogs, drawers)
$drastic: 8px/16px 25% (heavy emphasis)

## Z-Index

$layer0(0) · $layer1(10000) · $layer2(20000) · $layer3(30000) · $layer4(40000) · $layerMax(2147483647)
10,000 gaps between layers for intermediate stacking.

## Breakpoints (min-width, mobile-first)

@bp1(640px) · @bp2(768px) · @bp3(1024px) · @bp4(1280px)

> For responsive CSS patterns, see stitches-patterns skill.
