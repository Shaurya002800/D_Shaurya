# Weather control

The ship's weather badge is now a minimal native dropdown with Sunny, Rain, Night, Storm and Auto choices. A manual choice stays active until another choice is made. Auto resumes the existing three-minute cycle from the current weather; reduced-motion preferences still pause automatic cycling, while manual changes remain available.

The existing weather settings are shared by the control and scene. Selection updates the same lighting, ocean, atmosphere, rain and night deck effects as the original automatic cycle. No weather colours or effect settings were changed.

The control appears while exploring the deck. It stays out of the loader, introduction, guided tour, section views and Bounty Board. Its placement avoids the navigation, music and board controls on desktop, narrow phones and landscape phones. Native selection supplies touch and keyboard behavior without a custom menu dependency.

## Verification

- Production build passed; existing large scene bundle warning remains.
- ESLint passed for all changed JavaScript/JSX files; all 24 existing tests passed.
- Browser checks exercised all manual choices, stopping/resuming the automatic timer, the existing weather URL override, reduced-motion preference changes, keyboard event isolation and unmount cleanup under React Strict Mode. The three-minute timer was advanced by the browser test harness rather than waiting in real time.
- Layout checks passed at 1440×900, 1024×768, 390×844, 320×568 and 844×390, with readable selection text, at least 44px control height and no overlaps with the other controls.
- The actual website loaded its ship, changed through all four weather modes, hid the control behind the Bounty Board, restored the chosen mode after closing it, and accepted a mobile weather change with no runtime exceptions.

Detailed results are in `weather-control-results.json` and `weather-world-results.json`. Browser verification used only local assets and blocked external services.
