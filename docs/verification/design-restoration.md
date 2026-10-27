# Original design restored — 27 October 2026

The latest direction is to retain the original About poster and manga project presentation from the supplied screenshots, with updated factual content.

- Desktop Profile uses the original full sail: text on the left, portrait on the right, original parchment, anchors, typography, camera framing, Deck close button and Escape hint. No side journal covers this view. The introduction is corrected and comes from the shared profile data.
- Experience / Read Log remains a separate accessible HTML journal, reachable through the existing map. Phone and WebGL-unavailable Profile views also use the readable HTML fallback. Desktop poster copy is available to assistive technology as HTML.
- Projects use the original halftone cover, heavy ink panel borders, speech-tail synopsis, angled technique chips, red stamp, burst header, previous/next arrows and numbered bottom project rail. The layout was restored from the original repository implementation.
- Updated status, category and actual year replace fictional bounty, reader-hype and chapter/file numbers. The stamp now reads Source on File. Screenshot labels use the actual project status, not an indiscriminate live-project claim.
- The original synopsis panel now includes the verified problem and contribution, plus a keyboard-operable disclosure for implementation decisions, scope, screenshot context and source evidence. Live Demo and Source Code remain separate links.
- Eight featured projects remain the initial view. The compact archive selector exposes all 14 and category filters without additional ship objects.

## Verification

- Production build passed; the existing large Three.js chunk warning remains.
- Focused ESLint passed for App, About, manga page, project section and profile data.
- All seven content/assistant tests passed. `git diff --check` passed.
- Visually checked desktop at 1440×900 and phone at 390×844.
- Opened all 14 manga dossiers on mobile; all screenshots loaded and document width remained within the viewport.
- Verified disclosure click and Enter interaction, project filtering, keyboard focus wrap, and separate Peblo demo/source URLs.
- Verified the desktop Profile has its original two-column sail composition and no visible journal panel. Existing HTML Experience access remains available independently.

No deployment or publishing was performed. Screenshots in this folder show `about-restored.jpg`, `manga-projects-restored.jpg` and `manga-projects-mobile.jpg`.
