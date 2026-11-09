# v4 Implementation Plan

Branch: `v4-react-improvement` (from `v3-react`)

This file is the plan and the progress tracker for the v4 improvements. Tick an item as soon as
it is implemented and the automated checks pass (typecheck, unit tests, build). Items that change
behavior on the canvas are also listed under [Manual QA in Figma](#manual-qa-in-figma) until
someone has tried them in the Figma app.

Status legend: ✅ done · 🚧 in progress · ⏳ not started

## Working agreement

- One commit per feature. Each commit passes typecheck, tests and build on its own.
- The tracker below is updated in the same commit as the feature.
- Commit message format:

  ```text
  type(scope): short lowercase summary

  One short paragraph: what was wrong or missing, and why it mattered.

  - Concrete changes, with real examples ("Bala Gopal" -> balagopal)
  - Optional small headings when several areas change
  ```

---

## Progress tracker

| Phase | Area | Status |
| --- | --- | --- |
| 1 | Bug fixes | ✅ (Figma QA pending) |
| 2 | Field registry & code health | 🚧 |
| 3 | Regenerate & smarter filling | ✅ (Figma QA pending) |
| 4 | Data realism | ⏳ |
| 5 | UI, theming & quick actions | 🚧 |

### Phase 1 checklist: Bug fixes

- [x] 1.1 Await font loading before writing text (mixed-font layers no longer throw)
- [x] 1.1b Keep mixed styling: each word keeps the style of the matching word in the old text (`wordStyles.ts`)
- [x] 1.2 Layers with a missing font are written in Inter (closest weight) instead of failing, and the user is told how many
- [x] 1.3 Remove font preloading on `selectionchange`
- [x] 1.4 Strip spaces from names in Email / UPI
- [x] 1.5 Personal PAN uses the surname initial
- [x] 1.6 Fixed-length DIN and CIN numeric parts
- [x] 1.7 Year ranges relative to the current year (DoB, DL, CIN, BH series)
- [x] 1.8 "Select text layers" toast shows once
- [x] 1.9 Cap and validate the user count

### Phase 2 checklist: Field registry & code health

- [x] 2.1 Field registry in `src/fields.ts`
- [x] 2.2 `Person` class: lazy, cached, internally consistent fields
- [x] 2.3 Table / JSON / CSV generated from the registry
- [x] 2.4 Unit tests in `tests/` (Jest + ts-jest, 36 tests; Vitest's native binary is blocked by Windows Application Control on this machine)
- [x] 2.5 UI buttons and checkboxes rendered from the registry
- [ ] 2.6 Restructure state metadata in `dataSet.ts`
- [ ] 2.7 `strict` TypeScript + typed `PluginMessage` union

### Phase 3 checklist: Regenerate & smarter filling

- [x] 3.1 "Regenerate data" button in the properties panel (relaunch data)
- [x] 3.2 Table columns tagged as one person each
- [x] 3.3 Fill by layer name
- [x] 3.4 Fill repeated components (one person per selected instance/frame)
- [x] 3.5 "Regenerate selection" button in the plugin UI

### Phase 4 checklist: Data realism

- [ ] 4.1 Aadhaar with Verhoeff check digit (behind a "validator-safe IDs" toggle)
- [ ] 4.2 GSTIN mod-36 checksum
- [ ] 4.3 Voter ID (EPIC) as 3 letters + 7 digits
- [ ] 4.4 Region-aware names and real PIN postal-circle prefixes
- [ ] 4.5 New fields: gender, age, IFSC, bank account, company name, salary (₹ lakh format), blood group, regional-script names

### Phase 5 checklist: UI, theming & quick actions

- [x] 5.1 `themeColors: true` and Figma's theme; footer and theme button from the other plugins
- [ ] 5.2 Persist UI choices with `figma.clientStorage` (theme done; selections, user count, domain to do)
- [ ] 5.3 Copy-to-clipboard next to JSON/CSV download
- [ ] 5.4 Quick actions via manifest `parameters`
- [ ] 5.5 Seeded randomness
- [ ] 5.6 Auto-layout canvas table, "rows = users" layout, native FigJam table

---

## Implementation details

### Phase 1: Bug fixes

**1.1–1.3 Fonts.** New `src/functions/fonts.ts` with `writeText(node, text)`:
load every font in the node (`node.getRangeAllFontNames(0, len)`, or `node.fontName` when empty),
`await Promise.all(figma.loadFontAsync)`, then set `characters`. Nodes with `hasMissingFont` are
switched to Inter, which ships with Figma, in the closest style ("SemiBold" → "Semi Bold", italic
kept), falling back to Inter Regular. `writeText` returns `written | fallback | failed`, and
`WriteTally` turns the counts into one notification. A layer using a text style is detached from
it when its font is replaced. `generateTable` awaits Roboto Regular/Light before creating cells. The
`selectionchange` listener, `loadUserFont` and `setUserFont` are removed.

**1.1b Mixed styling.** Setting `characters` gives the whole new text the style of the first
character. So before writing, `writeText` reads `getStyledTextSegments` (font, size, fills, fill
style, text style, decoration, case, letter spacing, line height) and records the style of each
word. After writing, word N of the new text gets the style of old word N. Extra words take the
last word's style, and whitespace takes the style of the word before it. Text and fill styles are
re-linked with `setRangeTextStyleIdAsync` / `setRangeFillStyleIdAsync` (required by
`dynamic-page`). If restoring the styling fails, the text is still written. The word mapping is
a pure function (`planWordStyleRanges`) with unit tests. Known limit: styling *inside* a word
(e.g. a differently colored first letter) follows the word's first character.

**1.4 Names with spaces.** `generateEmail` and `generateUPIn` remove whitespace from both names
before composing (`"Bala Gopal"` → `balagopal`).

**1.5 PAN.** `generatePAN(lastName)`: 5th character = surname initial (upper-cased).

**1.6 DIN/CIN.** Use `numBetween` with fixed ranges: DIN 8 digits, CIN industry code 5 digits,
registration number 6 digits (zero-padded).

**1.7 Years.** `const thisYear = new Date().getFullYear()`.
DoB: `thisYear-80 … thisYear-18`. DL issue year: `max(dobYear+18, 1980) … thisYear`.
CIN: `1950 … thisYear`. BH series: `21 … thisYear % 100` (scheme started 2021).

**1.8 Toast.** Single check: no TEXT node in the selection → one notification.

**1.9 User count.** Plugin side (authoritative): `Number.isInteger`, `1 ≤ n ≤ 200` for the
canvas table, `≤ 10,000` for JSON/CSV. The UI input gets `max` and `step=1`.

### Phase 2: Field registry & code health

**2.1 Registry.** `src/fields.ts` exports `FIELDS: FieldDef[]`:

```ts
interface FieldDef {
  key: FieldKey;        // same keys the UI already sends ("Email", "UID", "Pass"...)
  label: string;        // table/CSV/JSON label ("UID (Aadhar)")
  group: FieldGroup;    // personal | profession | location | personalIds | businessIds
  inTable: boolean;     // CityState is button-only
  generate(p: Person): string;
}
```

UI checkbox keys stay `${key}Value`, so the UI ↔ plugin message protocol does not change.

**2.2 Person.** `person.get(key)` generates on first access and caches the value. Generators
read their dependencies from the person (`Email` ← `FirstName`/`LastName`, `City`/`PIN`/addresses ←
`State`, `DL` ← `State` + `DoB`, `GSTIN` ← `State` + `PANi`...), so a person's addresses share one
state, city and PIN.

**2.3 Outputs.** `generateTable`, JSON and CSV iterate `selectedTableFields(chkData)` and call
`person.get(field.key)`. The ~300 lines of copied per-field code are removed.

**2.4 Tests.** Jest + ts-jest, in `tests/` (outside the webpack `src` tree). Jest resolves `.ts`
before `.js`, because old ignored `tsc` outputs (`src/**/*.js`) still sit next to the sources. Format regexes for every field
over many iterations, plus consistency checks (email has no spaces, PAN 5th char = surname initial,
DL year ≥ DoB year + 18, address contains the person's city/state/PIN). Run with `npm test`.

**2.5 UI from the registry.** Both tabs map over `GROUPS` and `fieldsInGroup()` from
`fieldMeta.ts` (labels via `shortLabel`). The table presets come from
`tableSelection("default" | "all" | "none")` (`defaultInTable` per field). Shared pieces:
`Accordion` (now keyboard-accessible: `role="button"`, Enter/Space, `aria-expanded`) and
`ProfessionSelect` (one list of domains, `PROFESSION_DOMAINS`). The table tab's profession
dropdown is now controlled, so "Default" also resets the dropdown, not just the state. Tests pin
the default ticks and button order to the previous layout. The UI bundle does not include the
dataset (only `fieldMeta.ts`). FirstTab 407 → 126 lines, SecondTab 784 → 309.

**2.6–2.7** are follow-ups. They are mechanical refactors once the registry exists.

### Phase 3: Regenerate & smarter filling

**3.1 Regenerate button (relaunch data).**

- `manifest.json` gets
  `"relaunchButtons": [{ "command": "regenerate", "name": "Regenerate data", "multipleSelection": true }]`.
- When a text layer is filled, the plugin stores `pluginData.field = <FieldKey>` (and
  `pluginData.profDomain` for professions) and calls `node.setRelaunchData({ regenerate: "..." })`.
  Generated tables get relaunch data on the table frame.
- On launch, `code.ts` checks `figma.command`. For `"regenerate"` it skips `showUI`. It collects
  every tagged text node in the selection (including descendants), regenerates it, and calls
  `figma.closePlugin(<summary>)`.
- Tagging is best-effort: `setPluginData`/`setRelaunchData` calls are wrapped in `try/catch`
  (e.g. layers inside component instances, or editors without relaunch support), so filling never fails because of it.

**3.2 Person scope.** Each table user column gets `pluginData.person = "1"`. During regenerate,
text nodes are grouped by their nearest ancestor with that marker. Each group gets one new
`Person`, so a regenerated column stays consistent. Untagged layers are each their own person.

**3.3–3.4 Fill by layer name.** Field descriptions moved to `src/fieldMeta.ts` (no dataset
import, so the UI can use it later), each with `aliases` (`"e-mail"`, `"phone number"`,
`"aadhaar"`, `"gst no"`...). Names are normalized (lowercase, letters and digits only), and a
test makes sure no name maps to two fields. `planFillByName` (pure, in `fillByName.ts`) decides
who is who:

- Text layers selected together (shift-click) are one person. If a field repeats, they are
  split by parent frame, then one layer per person. A selected frame/card/instance is one person.
  Loose layers filled together share a `personId` in plugin data, so Regenerate keeps them together.
- If a container holds the same field more than once (a list of cards), it is split by
  child, so every card gets its own person. Loose text layers next to the cards share one person.
- Text layers still named after their content (`autoRename`) are skipped. A label showing
  "Email" is auto-named "Email" and must not be overwritten. Only renamed layers are filled.

Each card is tagged as a person scope and gets relaunch data, so 3.1's button regenerates it
as one consistent person. UI: a "Fill by layer names" card at the top of the first tab, using
the profession domain from the dropdown.

**3.5** New `regenerate-selection` UI message that reuses the same function as the relaunch
command. The button, "Regenerate selected data", sits in its own section at the bottom of the
first tab, because it works on anything the plugin filled, not only "Fill by layer names". The
data-type groups scroll above it, and the Buzz note is one line under it. The layout was checked
at 360×620 with headless Edge. The window was then raised to 360×700, so the tallest group
(Personal IDs) fits open in both tabs without scrolling, with room for Phase 4's new fields.

### Phase 4: Data realism

- **4.1** Verhoeff checksum on the 12th digit; first digit 2–9. Toggle in the UI, off by default,
  because validator-passing numbers are more likely to collide with real ones.
- **4.2** GSTIN check character: weighted mod-36 over the first 14 characters.
- **4.3** EPIC: `[A-Z]{3}[0-9]{7}`.
- **4.4** Add `region`/language tags to name lists and per-state PIN prefixes to state metadata (needs 2.6).
- **4.5** New registry entries. Each new field is one `FieldDef` plus data, and appears in the UI via 2.5.

### Phase 5: UI, theming & quick actions

- **5.1** Done together with the footer from the other plugins (desi-ipsum).
  `showUI(..., { themeColors: true })` replaces the editor-type guess (FigJam/Buzz = dark).
  This plugin keeps its own palette. The tokens sit on `html:root`, which is more specific than
  Figma's injected values, and Figma's `figma-dark` class only switches to the dark palette.
  Footer: ⚠️ disclaimer and theme icon buttons on the left, credit on the right. The theme button
  cycles 🌗 Auto (follows Figma) → ☀️ Light → 🌙 Dark via `html[data-theme]`, saved with
  `figma.clientStorage` (`themePreference`). `useFigmaTheme` (two separate copies of the
  state, in `ui.tsx` and the toggle) is replaced by `useThemePreference`.
- **5.2** `figma.clientStorage.setAsync("prefs", {...})` on change. Send to the UI on open.
- **5.3** `navigator.clipboard` is blocked in plugin iframes, so use a hidden `<textarea>` + `document.execCommand("copy")`.
- **5.4** Manifest `parameters` with suggestions from the registry. Handle `figma.on("run", ...)`.
- **5.5** Small seeded PRNG (mulberry32) replacing `Math.random` behind a `rng()` helper. Optional seed input.
- **5.6** Table built with auto layout (hug height, fixed column width, wrapped text). Option for
  users as rows. `figma.createTable()` when `figma.editorType === "figjam"`.

---

## Automated checks

Run before ticking anything:

- `npx tsc --noEmit -p .`: typecheck
- `npm test`: unit tests
- `npm run build`: production build

## Manual QA in Figma

Import `manifest.json` via *Plugins → Development → Import plugin from manifest*, then tick each item once it works.

- [ ] Fill a single text layer with each data type (font and styling preserved)
- [ ] Fill a text layer with mixed fonts (e.g. "**Rahul** Sharma"): first word stays bold, second regular
- [ ] Mixed layer where the new value has more words than the old one: extra words take the last word's style
- [ ] Mixed layer using text styles / color styles per word: styles stay linked (not detached)
- [ ] Mixed layer where one of the fonts is missing: only that word switches to Inter
- [ ] Fill a text layer whose font is missing: switches to Inter at the closest weight, notification shown
- [ ] Nothing selected / only non-text selected: one "select text layers" notification
- [ ] Table with 1, 10 and 200 users; 201 users is rejected with a message
- [ ] JSON and CSV export (CSV opens in Excel/Sheets with addresses in one column)
- [ ] Select a filled text layer: "Regenerate data" button appears in the properties panel and works
- [ ] Select several filled layers: button still appears (multi-selection)
- [ ] Select a generated table: regenerate replaces every column, each column stays consistent
      (email/UPI match the name, address matches city/state/PIN)
- [ ] Fill by layer names: a card with layers renamed "Name", "Email", "Phone", "Address"
      gets one matching person (email matches the name)
- [x] Fill by layer names on a selected frame / auto-layout frame: name and email match
      (checked by Abhijit)
- [ ] Fill by layer names with the text layers themselves selected (shift-click "Name",
      "Email", "Phone"): one matching person; Regenerate keeps them matching
- [ ] Fill by layer names: a label whose text is "Email" (auto-named) is left alone
- [ ] Fill by layer names: select a list frame with several cards, so each card gets a different person
- [ ] Fill by layer names inside component instances
- [ ] After fill by layer names, select the card: "Regenerate data" refreshes it as one person
- [x] Regenerate button in the plugin window regenerates previously filled layers (checked by Abhijit)
- [ ] "Regenerate selected data" (now at the bottom of the first tab) does the same as the properties-panel button;
      with nothing filled selected it says "Nothing to regenerate"
- [ ] Both tabs look and behave as before (same buttons, checkboxes, order, counts)
- [ ] Table tab: change the profession domain, then click "Default": dropdown shows "Random" again
- [ ] Accordions open/close with Tab + Enter/Space
- [ ] Footer: ⚠️ shows the disclaimer; theme button cycles Auto → Light → Dark with matching
      icons and tooltips
- [ ] Theme Auto follows Figma's light/dark theme (switch Figma's theme while the plugin is open)
- [ ] Theme choice is remembered after closing and reopening the plugin
- [ ] Repeat the fill and table checks in FigJam, Slides and Buzz
