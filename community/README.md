# Community page assets

Everything for the plugin's Figma Community page: icon options, cover and carousel slides.
The page text lives in [`../figma-page-description.md`](../figma-page-description.md);
tagline options and tags are in [`description.md`](description.md).

## What's here

| Path | What it is | Size |
|---|---|---|
| `exports/icons/icon-N-*-128.png` | Plugin icon, 4 options (**upload the 128 px one**; Figma rounds the corners) | 128×128 |
| `exports/icons/icon-N-*-512.png` | Same icons, large preview | 512×512 |
| `exports/icons/icon-options-overview.png` | All 4 options side by side, at 64/32/16 px on light and dark | 1920×1080 |
| `exports/cover-1920x960.png` | Community cover | 1920×960 |
| `exports/slide-1…4-1920x1080.png` | Carousel: data types, fill by layer names, user sets, quick actions + regenerate | 1920×1080 |
| `src/` | HTML/CSS/SVG sources for all images | — |
| `make-samples.mjs` | Writes `src/samples.js` from the plugin's own generators | — |
| `render.mjs` | Re-renders every PNG with headless Edge/Chrome | — |

## Icon options

1. **ID card**: a profile card with a saffron avatar and data lines, on indigo
2. **User list**: three users in rows, like a user set, saffron to rose
3. **Spark**: a person with a saffron sparkle ("users made for you"), on deep navy
4. **Kolam**: a person drawn in kolam (rangoli) dots, marigold on peacock teal

Options 1–3 stay readable at 16 px (Figma's smallest menu size). Option 4 turns into a
speckle there; it works best as a larger mark.

No India map or flag on purpose: the map outline is politically sensitive, and the national
flag can't be used as a brand mark. The Indian feel comes from colour and craft instead.

**Chosen: option 1 (ID card).** The cover and slides use it. To try another later:
`npm run community -- --icon 3` re-renders the cover and slides with that icon.

## Carousel

1. **28 data types**: every field, grouped like the plugin, with one real user's values
2. **Fill by layer names**: named text layers in the layers panel, three cards each filled as one person
3. **User sets**: a table in the plugin's own table style, the JSON export and the export/copy options
4. **Quick actions · Regenerate**: Figma's command bar with "aad" typed, and the right-panel Regenerate button

## Re-rendering

```sh
npm run build              # the cover embeds the real plugin UI from dist/
npm run community:samples  # optional: new sample users (src/samples.js)
npm run community          # icons, cover and slides with icon option 1
npm run community -- --icon 2
npm run community -- --icons-only
```

- Needs Edge or Chrome (set `EDGE_PATH` or `CHROME_PATH` if it isn't found) and an internet
  connection (fonts come from Google Fonts).
- The plugin windows on the cover are the **real plugin UI** (`dist/ui.html`) in an iframe, not
  mock-ups. `src/window.js` answers the UI's requests for the saved theme and choices, so one
  window is light on "Add to text layers" and the other dark on "Create user sets". Transitions
  are switched off inside the iframe so screenshots never catch a half-finished theme change.
- `src/samples.js` is real output of the plugin's generators. Regenerate it rather than typing
  data by hand, so the images always show what the plugin really makes. The slides pick
  presentable people from it by index (see `P` in `src/slides.html`).
