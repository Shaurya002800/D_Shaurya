# Verification results — 26 October 2026

These are the initial audit results. The current restored original layouts and their checks are documented in [design-restoration.md](design-restoration.md).

All changes remain local. No deployment, publishing, contact submission, booking, payment or message was performed.

## Automated checks

- `npm test`: 7 passed, 0 failed. Covers factual chronology, archive contracts, evidence assets, assistant knowledge, contact confirmation and chat HTTP contracts.
- `npm run build`: passed. Vite retains its large-chunk warning for the Three.js scene; the scene remains lazy loaded.
- Focused ESLint check passed for App, journal, archive, dossiers, error boundary, loader, intro, map, data, hooks, scene, entry point and chat API/client.
- Full `npm run lint`: 3 existing errors in `LuffyCharacter.jsx` (React immutability checks on the Three.js camera) and `Skillssection.jsx` (state updates in an animation effect); 4 existing hook dependency warnings in ship/skills code. These are not represented as a clean full-repository lint run.
- `git diff --check`: passed.

## Browser verification

Used the local Vite server and browser UI, at 1440×900 desktop, 390×844 phone and 844×390 landscape sizes.

- Open Map → Read Log reaches accessible About, Education and both MyPerro phases plus completed IEEE tenure. The sail/poster remains in the ship scene.
- Journal Shift+Tab wraps from its close button to Contact; Escape closes it and returns focus to navigation.
- Project archive supports Featured (8), All Projects (14), category filters and direct/previous/next navigation. Every one of the 14 project pages was opened on the phone viewport; every screenshot loaded successfully.
- Peblo has separate Live Demo and Source Code links.
- Research dossiers state research/synthetic scope and have no fabricated impact metrics.
- Phone pages have no document-level horizontal overflow. Filters scroll within their own row. Screenshots are contained and link to full resolution.
- Landscape initially left too little reading space. Hiding the project rail on short screens increased the scrollable dossier region from 75px to 224px; Previous/Next and filters still reach the archive.
- Mobile entry now leaves 3D loading optional, with a readable chart backdrop and visible Load Grand Line button.
- Forced WebGL context failure was exercised using `tests/fixtures/webgl-unavailable.html` through the dev server. Profile, journal, project filters and screenshots remain available with zero canvas elements. Free Roam is absent. The final fallback also suppresses movement controls.
- Reduced-motion behavior was checked in source: CSS and Framer preferences, immediate section camera transitions, skipped animated loader, stationary ocean/ship, stopped weather cycling, no sparkles or WebGL lightning. An OS-level preference toggle was not automated.
- Resume shortcut opened `/resume.pdf` in another tab. The journal's actual download was byte-identical to `public/resume.pdf`. Text extraction and page rendering confirmed completed February 2025–October 2026 tenure, current MyPerro wording, 300+ DSA problems and legible layout.
- Contact href resolves to the profile email. No contact action was sent or submitted.

## External checks and remaining facts

`external-links.json` records 67 read-only checks derived from current project, source-evidence and profile data. 65 returned 200, including redirected repository paths. Serenova Engine's public pilot timed out after 25 seconds; the site and assistant carry an availability note. LinkedIn returned 999 (automated-access restriction).

The public GitHub inventory had no RewindGuard X repository. It is excluded pending a source URL. Exact MyPerro transition months and individual module attribution remain unconfirmed. The prior NetraAI resume entry lacks independent dataset/benchmark/attribution evidence and remains explicitly qualified. Existing award/event credits were retained without adding new claims.

Screenshots beside this report show desktop/phone research dossiers and the corrected landscape layout. To repeat WebGL failure verification, run `npm run dev` and open `/tests/fixtures/webgl-unavailable.html`; this test fixture is not imported into the production bundle.
