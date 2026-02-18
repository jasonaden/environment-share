---
name: design-tokens
description: >
  Picnic design token system: colors, spacing, typography, shadows, radii, z-index.
  Use when applying colors/backgrounds/text, choosing spacing, setting typography,
  using shadows or radii, ensuring theme compatibility, or fixing raw CSS values.
  Keywords: $token, color, spacing, font size, theme, dark mode.
---

# Picnic Design Tokens

All values use `$token` syntax via `@attentive/picnic`. Tokens adapt automatically to light/dark theme.

## Golden Rule

- NEVER raw CSS values (hex, px, rem) — always $token syntax
- NEVER raw palette tokens ($grayscale*, $yellow*, etc.) in components
- ALWAYS functional/semantic tokens ($bg*, $text*, $icon*, $border*)
- Functional tokens auto-adapt to light/dark theme

## Two-Tier Color System

**Tier 1: Raw palette** — grayscale, yellow, green, red, brand colors. For custom theme creation only. Never in component code.

**Tier 2: ~97 functional tokens**, prefixed by usage:
- $bg* (~53): surfaces, actions, rows, toggles, semantic status, decorative
- $text* (~16): default, subdued, disabled, inverted, semantic, decorative
- $icon* (~15): default, subdued, disabled, inverted, semantic, decorative
- $border* (~13): default, input states, action, focus, toggle

State suffixes: Default → Hover → Pressed → Disabled → Selected

## Color Decision Guide (non-obvious choices only)

- Card/section bg: $bgAccent (not $bgDefault)
- Skeleton loading: $bgPlaceholder / $bgPlaceholderAlt
- Search highlight: $bgHighlighted
- Decorative categories: $bgDecorative1-4 (celery/cloud/steel/lavender)
- Note: $iconInfo (not $iconInformational), $borderInputError (not $borderInputCritical)

## Semantic Color Sets (use as coordinated groups, never mix)

| Status | bg | bgAccent | text | icon | border |
|--------|-----|----------|------|------|--------|
| Success | $bgSuccessDefault | $bgSuccessAccent | $textSuccess | $iconSuccess | $borderInputSuccess |
| Critical | $bgCriticalDefault | $bgCriticalAccent | $textCritical | $iconCritical | $borderInputError |
| Warning | $bgWarningDefault | $bgWarningAccent | $textWarning | $iconWarning | — |
| Info | $bgInformationalDefault | $bgInformationalAccent | $textInformational | $iconInfo | — |
| Guidance | $bgGuidanceDefault | $bgGuidanceAccent | — | $iconGuidance | — |

Decorative sets 1-4 (celery/cloud/steel/lavender): each has $bgDecorativeN{Default,Accent}, $textDecorativeN, $iconDecorativeN

## Spacing & Sizing

4px grid: $space0(0) through $space16(64px). Sizes mirror: $size0–$size16.

Common: $space1=icon gaps · $space2=tight · $space3=input padding · $space4=standard/card · $space6=section · $space8=large section

Breakpoint sizes: $bp1(640px) $bp2(768px) $bp3(1024px) $bp4(1280px) for max-width constraints.

## Typography

Fonts: $display (Ginto Nord — headings), $body (Ginto Normal — everything else)
Sizes: $fontSize1(12px) through $fontSize7(32px)
Weights: $regular(400) $bold(500) — ONLY these two. No semibold/medium/light.
Line heights: $lineHeight1(1) through $lineHeight7(1.5). Default: $lineHeight2(1.25).
Letter spacing: $letterSpacing0(0) $letterSpacing1(0.3px, default) $letterSpacing2(0.5px)

## Shadows, Radii, Z-Index

Shadows: $focus (double ring) · $inputFocus (single ring) · $shadow1-4 (elevation) · $drastic (heavy)
Radii: $radius1(4px) $radius2(8px) $radius3(16px) $radiusMax(pill)
Z-index: $layer0(0) · $layer1(10000) · $layer2(20000) · $layer3(30000) · $layer4(40000) · $layerMax
Border widths: $borderWidth0(0) $borderWidth1(1px) $borderWidth2(2px) $borderWidth3(4px)

## Cross-Scale References

In shadow/border strings, reference across scales:
- `boxShadow: '0 0 0 2px $colors$bgDefault'`
- `border: '$borderWidths$borderWidth1 solid $borderDefault'`

## Anti-Patterns

- DON'T: $grayscale0 → DO: $bgDefault
- DON'T: '#1B1F23' → DO: $textDefault
- DON'T: padding: '16px' → DO: p: '$space4'
- DON'T: opacity: 0.4 for disabled → DO: $bgActionPrimaryDisabled
- DON'T: mix semantic groups ($bgSuccessDefault + $textCritical)
- DON'T: fontWeight: 600 → only $regular(400) and $bold(500) exist

> Token lookup tables: see token-tables.md reference
