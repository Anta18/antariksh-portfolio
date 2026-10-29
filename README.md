# Antariksh Das — Digital, with a pulse

An independent creative developer portfolio: expressive websites, full-stack products, and interactive systems exhibits. Built with React, TypeScript, Vite, GSAP, Canvas/SVG, Matter.js, and progressively loaded Three.js scenes.

## Run locally

Node.js 22.12+ (Node 24 recommended).

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite. To validate and preview the production bundle:

```sh
npm test
npm run typecheck
npm run build
npm run preview
```

The eight model tests cover price/time order matching and partial fills, noncrossing orders, peer partitions and deterministic convergence, packet loss/retransmission with ordered delivery, deterministic synthetic signal generation, and finite-mass sticker release/reset and floor collisions. Browser QA also covers all four exhibits, project dialogs, architecture layers, the physics sandbox, themes, mobile navigation, and reduced motion.

## Deploy to Vercel

Import this directory as a Vercel project. The included `vercel.json` selects Vite, runs `npm run build`, and serves `dist`. No environment variables, database, email provider, wallet connection, or payment credentials are required by this portfolio. The email CTA opens the visitor's mail app. An existing production deployment is not changed by local development.

For a custom production domain, change the relative `og:image` in `index.html` to its absolute public URL and add the domain's canonical URL. The included social card is `public/social-preview.png`.

## Content and assets

- `src/data.ts` contains the seven web projects and four CV-based systems/research projects. Edit content and verified links here.
- Reflection is the e-commerce project formerly hosted at reflectionlingerie.com (now offline). Its card uses the genuine catalog design; its case study includes scrollable desktop storefront, product detail, and mobile captures exported through the connected Figma app on 29 October 2026. Images are labeled as design captures. There is no live-site or Figma link in the portfolio.
- `public/projects/*.webp` are genuine captures taken on 29 October 2026: Reflection comes from the original Figma frames; the other projects come from publicly accessible project pages. Frammer, dVote, and BHS show their public authentication/entry surfaces; no private account was accessed. These images are not previews of authenticated product screens.
- DAAO's features were checked against its public interface. Frammer and Zelta descriptions also use their public repository documentation. Other project descriptions use the supplied brief and CV.
- `public/Antariksh-Das-CV.pdf` is the supplied CV, with its original contents.
- Anton and Manrope are self-hosted; their OFL license files are in `public/fonts/`.

## Interactive exhibits

The Engine Room uses deterministic, local illustrations, not the original native executables or production data. Its visualizations are labeled accordingly. The original C++ matching engine's supplied 180ns p50 benchmark is contextualized in the project description and does not describe browser simulation speed.

Frammer's exploded diagram depicts the primary Next.js → FastAPI → PostgreSQL analytics path and a separate NLP/SQLite query branch. Select a layer with pointer or keyboard; the depth control separates the desktop assembly. Mobile gets selectable stacked tiles.

The hero is a live chrome/orange shader sculpture: drag directly to rotate/deform it and select Knot, Sphere, or Bloom to morph the mesh. A static SVG alternative preserves shape selection when WebGL or automatic motion is unavailable.

DAAO, Frammer AI, dVote, and Nullstate form the native-scroll featured card stack on desktop. The stack scales and tilts while a near-black overlay gradually dims the outgoing artwork by up to 22%. The overlay is capped in CSS and replaces animated brightness filters; reverse scrolling restores the original colors. Stack shadows use a fixed 10% ink opacity so the dark theme cannot black out the receding card. Paused motion and the unstacked mobile layout show undimmed artwork. Between the work and About sections, a pinned typographic sequence transforms a large asterisk into a graphic background. Mobile gets its own hero composition.

“Break the grid” uses Matter.js rigid-body physics. Drag any sticker immediately to release it, throw it, reverse gravity, or trigger a radial blast. Restoring order animates position and rotation back to the initial composition. Keyboard arrows and space launch a focused object. The particle-type study forms real text from sampled font pixels, repels points under the pointer, morphs between words, and responds to an explosion control. The frequency instrument offers Orbit, Flow, and Pulse harmonic fields, drag-to-tune frequency/resonance, sliders, and a freeze control. Optional Web Audio sound starts only after clicking Listen and mutes when the card leaves the viewport or the tab is hidden.

The Engine Room's 3D bars, disconnected peer, packet colors/positions, and signal curves now consume the actual local simulation state rather than independent decorative data.

## Accessibility and rendering

Light mode is the first-visit default. A manual choice is saved under `ad-theme`. Motion starts on by default, including when the device requests reduced motion. The header pause/play control saves an explicit choice under `ad-motion-v2`; legacy motion settings do not silently disable the new default. Both CSS and JavaScript effects follow the manual choice. Native scroll, semantic navigation, a skip link, keyboard-focusable controls, modal focus containment, Escape dismissal, focus restoration, and labeled chart descriptions are included. Canvas illustrations supplement accessible DOM controls and descriptions.

Three.js is shared between the interactive hero and Engine Room. Hero rendering pauses offscreen; the Engine Room mounts only near its viewport, with only the selected exhibit active. Rendering pauses when hidden; geometry, materials, observers, and the renderer are disposed on unmount. Reduced motion and unavailable WebGL use the static diagram. Font files are local WOFF2, screenshots are WebP, and media has reserved dimensions.

## Manual acceptance checks

Review 320, 390, 768, 1024, 1440, and 1920px widths, mobile landscape, and 200% browser zoom. Check light/dark themes, saved-theme restoration, reduced motion, all seven case studies and their return transitions, Frammer layer controls, keyboard-only navigation, copy-email fallback, CV download, and external URLs. Performance scores depend on the device, network, and hosting; use the production bundle when auditing.
