# Figma Design System Implementation

This document describes the design tokens and light/dark theme support of the Indian User Data Generator plugin UI.

## Features

### 1. Design System Tokens

- **Colors**: The plugin's own palette, with light and dark variants
- **Typography**: Font family and size tokens
- **Spacing**: Consistent spacing scale
- **Border Radius**: Standardized border radius values
- **Shadows**: Elevation shadows for different levels

### 2. Theme Support

- **Auto** (default): follows Figma's real light or dark theme
- **Light** / **Dark**: manual override from the footer theme button
- The choice is saved per user and remembered when the plugin is reopened
- Smooth 0.2s transitions between themes

## Implementation Details

### Where the theme comes from

`src/code.ts` opens the UI with `themeColors: true`:

```typescript
figma.showUI(__html__, { width: 360, height: 680, themeColors: true });
```

With `themeColors`, Figma adds a `figma-light` or `figma-dark` class to the UI's `<html>` and keeps it up to date when the user switches Figma's theme. Figma also injects its own `--figma-color-*` values. This plugin keeps its own palette, so those injected values are never used (see below).

### CSS Custom Properties

The tokens are defined in `src/ui.css`:

```css
/* Light palette (and typography, spacing, radius, shadows) */
html:root {
  --figma-color-bg: #f8fafc;
  --figma-color-text: #000000;
  /* ... more tokens */
}

/* Dark palette: Figma is dark and the user didn't pick Light, or the user picked Dark */
html.figma-dark:not([data-theme="light"]),
html[data-theme="dark"] {
  color-scheme: dark;
  --figma-color-bg: #2c2c2c;
  --figma-color-text: #ffffff;
  /* ... more tokens */
}
```

`html:root` is more specific than the `:root` / `.figma-dark` rules Figma injects, so the plugin's palette always wins. Figma's class only decides *which* palette is used.

### Theme preference

The footer theme button cycles **🌗 Auto → ☀️ Light → 🌙 Dark**. The tooltip names the current and the next theme.

- `src/hooks/useThemePreference.ts` holds the preference and sets `data-theme` on `<html>`: no attribute for Auto, `light` or `dark` otherwise.
- The preference is stored with `figma.clientStorage` (key `themePreference`). The UI iframe can't rely on `localStorage` inside Figma.

```typescript
const { preference, cycle } = useThemePreference(); // "auto" | "light" | "dark"
```

Messages between the UI and `src/code.ts`:

| UI → plugin | Plugin → UI |
| --- | --- |
| `get-theme-pref` (on open) | `theme-pref` with `value` (`"auto"` if nothing saved) |
| `set-theme-pref` with `value` (on click) | none |

## Usage

### Using Design System Tokens

Replace hardcoded values with design system tokens:

```css
/* Before */
.button {
  background-color: #ffffff;
  color: #000000;
  padding: 8px;
  border-radius: 4px;
}

/* After */
.button {
  background-color: var(--figma-color-bg);
  color: var(--figma-color-text);
  padding: var(--figma-space-sm);
  border-radius: var(--figma-radius-sm);
}
```

Components don't need to know the current theme: every color comes from a token, and the tokens switch with the theme.

## Design System Tokens

### Colors

- `--figma-color-bg`, `-bg-secondary`, `-bg-tertiary`: Background colors
- `--figma-color-text`, `-text-secondary`, `-text-tertiary`, `-text-disabled`: Text colors
- `--figma-color-border`, `-border-strong`: Border colors
- `--figma-color-bg-brand` (+ `-hover`, `-pressed`), `--figma-color-text-brand`: Brand/primary colors

### Typography

- `--figma-font-family`: Font family (Inter)
- `--figma-font-size-*`: Font sizes (xs, sm, md, lg, xl)

### Spacing

- `--figma-space-*`: Spacing values (xs, sm, md, lg, xl, xxl)

### Border Radius

- `--figma-radius-*`: Border radius values (sm, md, lg, xl)

### Shadows

- `--figma-shadow-*`: Shadow values (small, medium, large)

## Footer

Same layout as the author's other plugins (e.g. desi-ipsum):

- Left: small square icon buttons (`.icon-button`, 25×25px): ⚠️ disclaimer and the theme button
- Right: "by Abhijit Chirde" credit

## Testing outside Figma

Opening `dist/ui.html` in a browser shows the light palette (no `figma-dark` class). To preview dark, add the class
in the browser's dev tools: `document.documentElement.classList.add("figma-dark")`.

## Benefits

1. **Consistency**: All UI elements use the same design tokens
2. **Maintainability**: Easy to update colors and styles globally
3. **Accessibility**: Proper contrast ratios in both themes
4. **User Experience**: Follows Figma's theme, with a remembered manual override
5. **Future-proof**: Easy to add new themes or modify existing ones
