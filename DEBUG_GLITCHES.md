# Debug / Glitch Tracker

Last updated: 2026-03-01 (session 2)

Purpose:
- Track defects and regressions that are not feature roadmap items.
- Keep `DEVELOPMENT_TRACKER.md` focused on feature scope.

Legend:
- `[ ]` Open
- `[x]` Fixed

Metadata format for issue entries:
- `Meta: ID:<id> | A:<date> | U:<date> | T:POC | Repro:<short steps> | Expected:<expected behavior> | Actual:<observed behavior>`

## Open Issues

- No open glitches logged yet.

## Fixed Issues (session 1)

- [x] Hand viewport height could lag behind animated card positions, causing the orange table area to clip the bottom of the outer cards until another slider was touched.
  Meta: ID:CTP-DBG-001 | A:2026-02-28 | U:2026-03-01 | T:POC | Repro:Set hand view, increase arch/phi depth to a large value, wait for card transition to settle | Expected:The visible table frame resizes with the settled hand geometry immediately | Actual:The frame was measured before transition completion and remained too short until a second control change triggered another layout pass
- [x] Debug hand-curve overlay could drift a few pixels below the intended bottom-center anchor path when derived from smoothed rendered bounds instead of the hand geometry itself.
  Meta: ID:CTP-DBG-002 | A:2026-02-28 | U:2026-03-01 | T:POC | Repro:Enable hand-curve debug overlay on a curved hand and compare the line to the card bottom-center anchors | Expected:The debug line passes exactly through the active anchor-point path | Actual:The overlay could appear slightly lower than the card anchor points

## Fixed Issues (session 2)

- [x] Arc-mode hand: outermost card corners fell slightly outside the visible table frame at high VF values.
  Meta: ID:CTP-DBG-003 | A:2026-03-01 | U:2026-03-01 | T:POC | Repro:Arc mode, 7 cards, VF=0.5, default angles; outer card corners clip | Expected:All card geometry remains within the padded content area | Actual:VF clamp used `cardWidth` as B in the linear model, which underestimates for arc mode because rotated cards contribute `cardHeight × sin(angle)` to horizontal extent; fixed by computing B from `buildLayouts(0)` bounding box
- [x] Table frame stayed at minimum width when drawing a large hand instead of expanding to page width.
  Meta: ID:CTP-DBG-004 | A:2026-03-01 | U:2026-03-01 | T:POC | Repro:Draw 20+ cards in hand view; orange rectangle stays narrow | Expected:Orange rectangle expands toward page width to accommodate the hand | Actual:`maxContentWidth` was read from `tableScroll.clientWidth` before the frame had reflowed to its fit-content size; fixed by computing the limit from `getComputedStyle(tableSection).maxWidth` instead
