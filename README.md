# TenderAI — Marketing site

Landing page for **TenderAI**, the AI procurement co-pilot for government.
Vanilla HTML / CSS / JS — no build step, no framework. Mirrors the product's
design language (DM Sans, primary `#0F5EE8`, Lucide-style icons) and is built to
India's **GIGW 3.0 / UX4G** guidance and **WCAG 2.1 AA**.

## Run locally

```bash
python3 -m http.server 5181 --directory .
# → http://localhost:5181
```

No dependencies. Open `index.html` directly or serve the folder.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The full landing page (semantic, landmarked, inline SVG icons) |
| `styles.css` | Design system (tokens) + all component styles |
| `script.js` | Progressive enhancement only — mobile nav, scroll-reveal, demo form |

The page is fully readable and navigable **without JavaScript** (FAQ uses native
`<details>`; reveal animations are gated behind a `.js` flag).

## Design tokens (match the product)

Defined as CSS custom properties at the top of `styles.css`:

- **Font:** DM Sans (400/500/600/700)
- **Primary:** `#0F5EE8` · light `#EFF6FF`
- **Functional:** success `#10B981`, warning `#F59E0B`, danger `#EF4444`, purple `#8B5CF6`
- **Ink:** `#111827 / #374151 / #4B5563 / #6B7280` · line `#E5E7EB` · surface `#F9FAFB`
- **Radii:** 8 / 12 / 16 px · **Shadows:** `--shadow-soft` / `--shadow-lift`

> Note: success green is darkened to `#047857` when used as *text* (AA contrast).

## Section map

Utility bar → header → hero (with product mock) → problem → **lifecycle rail** →
**modules bento** (flagship = Tender Creation) → AI co-pilot → security (dark) →
outcomes → FAQ → CTA + demo form → footer.

## Accessibility

Skip link, semantic landmarks, AA contrast, visible focus (`#0F5EE8` ring),
keyboard-operable disclosures, `prefers-reduced-motion` respected, 44px touch
targets, labelled form fields, responsive down to 320px.

## TODO before launch

- **Wire the demo form** (`#demoForm` in `index.html`) to a backend / email
  endpoint — it is currently front-end only and just shows a confirmation.
- Add a real **Accessibility Statement** page (GIGW requirement; footer links to `#accessibility`).
- Replace placeholder anchors (`Sign in`, `Privacy`, `Terms`) with real routes as
  the rest of the site is built.
