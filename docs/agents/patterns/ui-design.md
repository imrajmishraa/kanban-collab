# Pattern — UI and design

How a surface in this app gets its look, and where a design skill is allowed to
act. Read with `DESIGN.md` (the rules) and
[`../skill-selection.md`](../skill-selection.md) (who wins when two disagree).

## The authority chain

```
DESIGN.md                 what it looks like
styles/tokens.css         the values, dark on :root
styles/theme.css          the same values, light on .light-theme, plus @theme
styles/components.css     the shared recipes: .m-btn, .m-btn-outline, .m-btn-ghost
```

A design skill sits **below** all four. It can improve a surface that follows
them; it cannot replace them. `impeccable` in its `typeset` mode is the clearest
case: it audits hierarchy, role scale and measure, then improves the faces
`DESIGN.md` already names — it does not pick a fourth family.

## The rules a design change must survive

| Rule | Where it is written | What enforces it |
|---|---|---|
| Colour comes from a token, never a raw utility | `DESIGN.md` → *Colour* | `node scripts/check-theme-colors.mjs --strict` |
| Every token has a value in both themes | `styles/tokens.css` (`:root`) and `.light-theme` | `src/design/tokens.test.ts` |
| Depth is a hairline, not a shadow | `DESIGN.md` → *Shape* | review — and the `box-shadow` ban in *Motion* |
| Three faces: Inter (interface), Plus Jakarta (headings), JetBrains Mono (numbers, keys, micro-labels) | `DESIGN.md` → *Typography* | review; a fourth family needs a reason in the PR |
| Motion: 300ms ceiling, reduced motion, at most two principles per component | `DESIGN.md` → *Motion principles* | review, and `MotionConfig reducedMotion="user"` in `app/App.tsx` |
| One icon library | `DESIGN.md`; 144 files import `@hugeicons/react` | review |

The colour gate keeps a **ledger** (`scripts/theme-colors-baseline.json`) of
twenty grandfathered raw colours. The ledger only shrinks: fixing one means
deleting its entry in the same change, and adding one is a decision with a line
in the PR saying why.

## Where each design skill slots in

| Skill | May | May not |
|---|---|---|
| `impeccable` (`typeset`) | audit a surface, then adjust hierarchy, role scale, measure and weight | choose a new family, or restyle the token set |
| `hugeicons` | choose, size and stroke an icon from the library already in use | introduce a second icon library |
| `icons-badges` | icon and badge patterns, and the motion that carries them | invent a second icon set |
| `better-icons` | a second reading when an icon is ambiguous | swap the library |
| `pikaicons-skills` | how an icon animates on hover, press, arrival | its icon set — this app draws from Hugeicons |
| `uizze-ui` | structure ideas for a prototype | the app's tokens, radii and shadows |
| `vercel-ui-skills` | component structure for a new surface | the token system |
| `web-design-guidelines` | a review pass against a published checklist | overriding `DESIGN.md` |
| `doodle` | a sketch inside a note | the app's chrome |

## Anti-patterns, with the rule each breaks

```tsx
// breaks: colour comes from a token — lint:colors fails on this
<p className="text-white/70">…</p>

// breaks: depth is a hairline, not a shadow
<div className="shadow-lg rounded-2xl">…</div>

// breaks: three faces, not four
<h2 style={{ fontFamily: "Satoshi, sans-serif" }}>…</h2>

// breaks: nothing scales on entry (DESIGN.md → Motion)
<motion.h1 initial={{ scale: 0.9 }} animate={{ scale: 1 }} />
```

## Verification

```
node scripts/check-theme-colors.mjs --strict     # 0 new findings
node scripts/check-surface.mjs --strict          # hover-only, vh, touch targets
```

- [ ] Looked at it in **both** themes — `:root` is dark, `.light-theme` is the override
- [ ] Looked at 320, 768 and 1024 (`change-rules.md` §5) — or said which you could not
- [ ] Text is 4.5:1 against what is behind it; control edges and focus rings 3:1
- [ ] Every state exists: default, hover, `focus-visible`, active, disabled, loading, error, empty
- [ ] Hover is never the only path; touch targets are ≥ 44×44 (`h-11`)

## What no skill here decides

The palette, the radii, the two themes, the type scale, the motion ceiling. Those
are `DESIGN.md`'s, and a PR that changes them changes `DESIGN.md` in the same
diff or does not land.
