# Validation — 29 October 2026

## Prior production audit — motion redesign

This audit predates the latest frequency-instrument update. The current update was checked with the production build and focused browser checks below; Lighthouse was not rerun for it.

Lighthouse 13 / headless Chrome / default mobile profile against the local production preview:

| Category       | Score |
| -------------- | ----- |
| Performance    | 100   |
| Accessibility  | 100   |
| Best practices | 100   |
| SEO            | 100   |

Measured FCP and LCP: 0.8 seconds. Total blocking time: 50ms. Cumulative layout shift: 0. Scores describe local lab runs, not a guarantee of deployed performance. Accessibility was rechecked after the final contrast and touch-target corrections. Three.js is a separate on-demand chunk, approximately 122KB gzip, shared between the hero sculpture and on-demand Engine Room. The page renders its typography and fallback artwork before the sculpture initializes.

## Checks completed

- Production TypeScript check and Vite build.
- Eight automated model tests, including finite-mass body release, repeated parking/reset, and floor collisions: price/time matching, resting and partially filled orders, partition/rejoin convergence, deterministic conflict resolution, retransmission with in-order delivery, and finite deterministic signals.
- Browser layouts at 320, 390, 768, 1024, 1440, and 1920px without horizontal page overflow.
- Mobile landscape at 844×390; 720×500 viewport to exercise layout at the effective size of a 1440px browser at 200% zoom. Physical browser zoom was not separately measured.
- All seven mobile project dialogs, modal Tab containment, Escape dismissal, and focus restoration.
- Frammer's layer selector and architecture explanation.
- All four exhibits: matching orders, signal controls, disconnect/edit/reconnect, packet loss/retransmit/reset.
- Physics activation and reset, saved dark theme across reload, mobile menu navigation, and reduced-motion interactions.
- Product filters and genuine responsive image variants.
- Successful clipboard copying and denied-permission fallback.
- CV, social image, and robots asset responses.
- WebGL failure fallback retaining usable DOM simulation controls.
- Visual review of desktop and mobile layouts, project presentation, dark theme, and engineering scene.

Project captures use public entry pages. Frammer, dVote, and BHS authenticated screens were not accessed. Reflection (e-commerce) uses genuine catalog, desktop storefront, product detail, and mobile frame captures exported through the connected Figma app. They are labeled as design captures, since the former site reflectionlingerie.com is offline. No Figma or defunct live link is shown.

## Motion redesign checks

- Real WebGL sculpture rotation under pointer drag and morphing between three shapes, with a functional SVG fallback.
- Pinned typographic sequence: changing transforms, expansion, and final reveal at different scroll positions.
- Dragging a physics object works before the activation button is used. The held object follows the pointer, multiple objects travel, bodies remain finite, and reversing gravity moves them upward.
- Reset returns all eight objects to their original positions and rotations across repeated release/reset cycles.
- Particle repulsion, word changes, and radial explosion alter the actual rendered canvas pixels.
- Engineering scene geometry consumes actual order, peer, packet, and signal state.
- Motion now starts ON by default, including with an OS reduced-motion preference or legacy motion-off settings. Explicit manual pause/resume choices persist under the current settings key.
- Public project dialogs, focus containment/restoration, work filters, download links, and denied-clipboard fallback were rechecked after the redesign.

## Default-on motion, featured work, and harmonic instrument update

- Fresh startup enables both CSS and JavaScript motion, including under an OS reduced-motion preference and with legacy motion-off storage present. Explicit manual pause and resume survive reload.
- Nullstate is the fourth featured project, appears once, and opens its project portal. Additional work now contains three projects.
- Earlier revision: brightness filters were removed and mid-transition swatches matched the original artwork. The bounded dimming update below supersedes this undimmed treatment.
- Orbit, Flow, and Pulse modes alter the actual canvas; XY dragging updates frequency and resonance. Freeze/resume controls stop and restart the visual frames.
- Sound remains off on load, starts only on Listen, mutes on request, and suspends when the instrument moves out of focus. The audio startup also checks for an intervening scroll or tab switch.
- The instrument was checked at 320, 390, 768, 1024, 1440, and 1920px, and visually reviewed in both themes.
- Production TypeScript/build and all eight model tests pass.

## Reflection design archive

- Connected Figma access succeeded. Exported the original catalog (`30:2104`), desktop storefront (`30:1406`), product detail (`30:1874`), and mobile storefront (`2047:2`) frames.
- Replaced the temporary brand cover with the real catalog; added three lazy-loaded, scrollable design screenshots to the case study. Optimized local WebP images preserve the source compositions.
- Verified images load, keyboard arrows scroll each screenshot, the modal restores focus on close, and no Figma or offline-site action appears.
- Browser review at 320, 390, 768, and 1440px; no horizontal overflow, including after resizing an open modal. Checked light and dark themes with zero page errors.
- TypeScript and production build pass. Prior Lighthouse scores above were not rerun for these image/content changes.

## Bounded selected-work dimming

- Restored gradual outgoing-card dimming with a CSS ink overlay animated from 0 to 0.22. CSS clamps the opacity; card transforms no longer animate brightness filters.
- Rendered testing caught the next card's opaque, paper-colored shadow blackening the remaining strip in dark mode. Replaced it with a fixed 10% ink cast shadow in both themes.
- Rechecked the production bundle at 1024×768, 1440×1000, and 1920×1000 in light and dark themes. All three overlaps passed at 0%, 25%, 50%, 75%, and 100% progress, plus reverse scrolling. Screenshots were also sampled during continuous scroll before the scrub animation settled.
- Analyzed 148 actual rendered color samples. Early/mid-transition samples match the capped overlay, and the darkest visible sampled artwork retained 75% of its original RGB brightness. Fully occluded samples were excluded. No black frames were observed; no browser page errors occurred.
- Verified opening a dimmed card, an undimmed case-study portal, closing with restored focus/scroll, and clearing active shade when motion is paused.
- Verified dimming resets when resizing below the stack breakpoint. Checked 320px and 390px mobile, 844×390 landscape, and returning to desktop.
- TypeScript and production build pass. Full Lighthouse audit was not repeated for this animation adjustment.
