# Design direction

A daily-use coaching tool, used one-handed, often mid-workout. One person uses it. It must be scannable at arm's length and never feel like a marketing page or a generic dashboard template.

**Tone:** calm, utilitarian, warm. **Memorable detail:** the number is the hero. Reps, seconds, levels and percentages are set large in tabular figures, and one warm accent marks "the thing to do now". Everything else stays quiet.

Sources distilled: anthropics/skills `frontend-design`, pbakaus/impeccable, ui-ux-pro-max, Refactoring UI, ECC `frontend-design-direction` + `make-interfaces-feel-better`, `artifact-design`.

## Tokens (defined once in `src/index.css`, used as Tailwind utilities)

| Token | Dark | Light | Use |
|---|---|---|---|
| `ground` | `#0b0f19` | `#f6f4ef` | page background (ink with a blue bias / warm off-white, never pure black or white) |
| `raised` | `#141a27` | `#ffffff` | primary surfaces (cards that hold actions or the main object) |
| `inset` | `#0f1420` | `#eeeae2` | secondary fills (notes, list rows, chips, timers' track) |
| `line` | `#243044` | `#e3ded4` | hairline borders, dividers |
| `ink` | `#f1f3f8` | `#171a21` | strong text |
| `body` | `#c3c9d6` | `#3f4652` | body text |
| `muted` | `#8a93a6` | `#6b7280` | labels, hints (never below 4.5:1 on its surface) |
| `accent` | `#fb923c` | `#c2410c` | the one warm action colour: primary buttons, active nav, "why today" bar, current level |
| `on-accent` | `#1a1206` | `#ffffff` | text on accent |
| `good` | `#34d399` | `#047857` | done / progress (semantic, never decorative) |
| `warn` | `#fbbf24` | `#b45309` | attention (backup reminder, soft gates) |
| `danger` | `#f87171` | `#b91c1c` | hard stop, destructive |

Only three text colours. Semantic colours are never the only signal (always paired with a word).

## Type and spacing

- Font: `system-ui` stack (no external fonts; the app makes no external calls). Scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48. Body 16px, line-height 1.5. Nothing below 12px.
- Numbers that change (reps, seconds, kg, %, level) use `.num` (tabular figures, semibold, tight tracking). Hero numbers are 36–48px.
- Headings use `text-wrap: balance`; short body text `text-wrap: pretty`.
- No uppercase-tracked labels. Section labels are sentence case, 14px, muted.
- Spacing scale 4 / 8 / 12 / 16 / 24 / 32; layout gaps via `gap`, one 16px page gutter set in the shell.

## Surfaces and hierarchy

- Cards have a role: `raised` (default, hairline border) for the main object and actions; `inset` (fill, no border) for notes and secondary info; `plain` (no box) for lists with dividers.
- Never a card inside a card. Repeated items in a list share edges and use dividers, not stacked cards.
- Radius: outer 16px, inner 12px, controls 12px, chips 999px. Nested radius = outer − padding.
- One accent per screen region: the primary action, or the current item, not both.

## Controls and motion

- Tap targets ≥ 48px, primary in-session buttons ≥ 56px, 8px between targets.
- Buttons: `accent` primary, `inset` secondary, text-only ghost, `danger` only for stop/reset. Press state `scale(0.97)`, 120ms; transitions name their properties; `prefers-reduced-motion` disables them.
- Timers (rest, hold) use one SVG progress ring with the number inside. Same ring, same size, everywhere.
- Inputs: visible labels, errors next to the field in plain voice.

## Copy

- Sentence case. No em dashes in UI strings; use a comma or a full stop.
- Verbs match results: "Log set" → "Set logged". Empty states say what to do next.
- Never "failed", "missed", "behind". A stopped set reads "8 of 10".

## Charts

- Line/bar colours from tokens (`accent`, `good`, `muted`); grid lines `line`; axis labels `muted` 12px; one scale per chart; nothing outside the plot.

## Checklist before shipping a screen

1. First viewport shows the object or action, not a heading and a paragraph.
2. Three text colours, one accent, no uppercase tracking.
3. No nested cards; lists use dividers.
4. Numbers are tabular and sized by importance.
5. Contrast ≥ 4.5:1 in both themes (check the muted colour on inset fills).
6. Buttons ≥ 48px, in-session ≥ 56px.
7. No `transition-all`, reduced motion respected.
8. Copy passes the shame guard and has no em dashes.
