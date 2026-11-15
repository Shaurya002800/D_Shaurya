# Atlas typography only

The original colours, backgrounds, borders, shadows, rounded panels, controls, spacing and layout are restored. The shared stylesheet at `src/styles/atlas-theme.css` contains typography only: font families, weights, sizes, line heights, letter spacing and capitalisation.

The locally hosted Atlas Display heading font and its loader readiness check are retained. Body text uses Georgia and small interface labels use Courier. The font subset is at `public/fonts/atlas-display.woff2`; the original license is at `public/fonts/pirata-LICENSE.txt`.

## Validation

- Production build passed.
- Browser comparisons verified that computed colours, background images, border colours, border radii, shadows and blur match the previous component styling for desktop navigation, desktop tour, mobile navigation, narrow-phone navigation, mobile tour and the skills board.
- Updated navigation retains the serif font on desktop and mobile with no horizontal page overflow.
- ESLint passed for the modified JSX except the pre-existing Skillssection hook findings, previously confirmed on the committed version. No skill behaviour was changed.

The previews and `atlas-font-results.json` alongside this note reflect the restored original palette with the new fonts.
