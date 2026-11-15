# Bounty Board materials and movement

The posters use a photographed-looking parchment surface created with the built-in image generator, existing generated character portraits, locally hosted display lettering, live HTML text, and CSS lighting. Navigation stays accessible to keyboard and touch users.

## Saved materials

- Paper: `public/textures/bounty-parchment.webp` (640 pixels wide, approximately 95 KB).
- Lettering: `public/fonts/bounty-wanted.woff2` (ASCII subset, approximately 25 KB), derived from Rye by Sorkin Type Co. The subset's internal family and PostScript names have been changed to Bounty Wanted. The original SIL Open Font License is retained at `public/fonts/rye-LICENSE.txt`.
- Character assets and their generation prompts: [bounty-portrait-prompts.md](bounty-portrait-prompts.md).

The opening loader waits for the parchment image to decode and the display font to load. Failed requests resolve safely so a missing decorative asset cannot strand the loader. Four character portraits and the captain photograph retain the same preload behavior.

## Paper generation prompt

Use case: photorealistic-natural. Asset type: a blank material texture for the physical paper of a pirate wanted notice, used behind live HTML text and a separate character portrait. Photograph a single antique sheet of thick rag paper, straight-on, flat lay, the sheet fills the entire portrait frame from edge to edge. Realistic 200-year-old sea-worn parchment: pale ochre ivory in the broad center so dark printed text will stay readable, heavily oxidized tobacco-brown and nearly black scorched perimeter, irregular small missing bites along the edges, delicate visible paper fibers, saltwater tide marks, a few dark foxing speckles, subtle diagonal wrinkles and an old horizontal fold. Natural creases and curling corners with realistic shallow paper relief. Low-key sinister pirate archive atmosphere, real tactile material, highly detailed analog photographic surface. Keep the middle 75 percent quiet and light, no large stains there. No letters, no typography, no symbols, no character, no face, no frame, no objects, no background scenery, no collage, no illustration, no watermark. Portrait 2:3 composition.

## Movement

- Existing horizontal drift, touch swipe, wheel, arrow buttons, and keyboard arrows remain available.
- Mouse movement adds a small perspective tilt and moves the paper highlight. Leaving a poster resets its tilt.
- Slow lantern lighting, haze, a few dim embers, and paper highlights add atmosphere without rapid flashing.
- Pause stops the automatic drift and atmosphere. Hover or keyboard focus pauses the posters for reading.
- The operating system's reduced-motion setting disables drift, sway, tilt, atmospheric animation, and movement transitions.
