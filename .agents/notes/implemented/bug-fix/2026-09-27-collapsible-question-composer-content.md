# Agent Note: Collapsible Question Composer Content

Status: implemented

English | [中文](2026-09-27-collapsible-question-composer-content.zh.md)

## Problem

When an agent calls `ask_user_question` with a long `question` prompt or extensive supporting markdown in `detail`, the rendered question card occupied almost the entire available viewport. Because the card has a maximum height cap of `min(60vh, 520px)` and `.header` was styled with `flex-shrink: 0` without height constraints, a long question title expanded the header and compressed the `.options` container down to 0px, pushing option items and the footer buttons completely out of view. Users could neither see nor scroll to the selectable choices.

## Decision

The question card layout decouples the header, supporting detail, choices list, and footer into dedicated, bounded regions:

1. **Collapsible question title**: The `.headingBlock` container caps its resting height to `min(10vh, 52px)` with `overflow: hidden`. When the text overflows this boundary, a localized button (`nav.expandQuestion` / `nav.collapseQuestion`) appears, allowing the user to expand the title into an independent scrollable box capped at `min(60vh, 360px)` with `overflow-y: auto`.
2. **Collapsible supporting detail**: The question detail block (`.detail`) is capped to `min(12vh, 72px)` by default and exposes a toggle (`nav.expandDetail` / `nav.collapseDetail`) when overflow occurs, expanding into an independent scroll container capped at `min(48vh, 320px)`.
3. **Dedicated choices scrollport and fixed footer**: The `.body` flex container keeps `min-height: 0; overflow: hidden`, delegating scrolling exclusively to `.options` (`flex: 1 1 auto; min-height: 0; overflow-y: auto`). The card `.footer` remains `flex-shrink: 0` at the bottom of the card, guaranteeing that navigation, skip, and submit actions remain visible and clickable regardless of prompt length.
4. **Responsive and accessible disclosures**: Buttons use standard `aria-expanded` and `aria-label` attributes with bilingual dictionary support in `locales.ts`. Container resizing is tracked via `ResizeObserver` with fallback measurement.

## Verification

The behavior is verified across three test layers:
- `composer-styles.client.spec.ts` verifies the CSS Module declarations for heading caps, scrollport boundaries, and fixed footer behavior.
- `user-questions-composer.client.spec.tsx` tests disclosure interactions, single/multi-choice selection with long text, and batch submission under mocked layout metrics.
- `apps/web/tests/question-composer.e2e.ts` tests real browser rendering in Chromium across 380px, 440px, and 520px viewport heights, confirming that option lists remain scrollable and footer buttons stay inside the card bounds.
- All 54 unit/component tests in `packages/client/ui-user-questions` and the full Playwright browser suite pass cleanly without regressions.

## Alternatives considered

**Only increasing the card `max-height`.** Increasing the card cap from 520px to a larger value does not resolve the issue on smaller screens, mobile views, or when a model emits prompts exceeding 1000 characters. Unbounded header growth would still starve the option list.

**Moving long questions into `detail`.** Shifting long prompt text into `detail` still places it above the option list in the same flow. Without separate scroll boundaries, a long detail section reproduces the exact same starvation of the option rows.

## Consequences

Overlong questions no longer obscure choices or prevent users from responding. Titles and detail sections remain fully readable through explicit disclosure controls while keeping choices and submission buttons immediately accessible.
