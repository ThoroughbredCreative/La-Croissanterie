# Changelog: premium polish + performance pass (2026-10-24)

`index.html` is the readable source. `npm run build` writes the minified site to `dist/`, which is the folder to deploy. The pre-change page is kept in `_original/` for reference; don't deploy it.

## Lighthouse (mobile, simulated throttling, median of 3)

|                 | Before  | After (`dist/`) |
|-----------------|---------|-----------------|
| Performance     | 90–91   | **100**         |
| FCP             | 2.8 s   | 1.4 s           |
| LCP             | 2.8 s   | **1.5 s**       |
| TBT             | 0 ms    | 0 ms            |
| CLS             | 0       | 0               |
| Speed Index     | 2.8 s   | 1.4 s           |
| Total transfer  | 121 KiB | 101 KiB         |
| A11y / BP / SEO | 100 / 100 / 100 | 100 / 100 / 100 |

These were measured locally with Edge headless, against a gzip static server.

## Performance
- **Hero is no longer hidden behind JS.** `.reveal` was removed from the hero. A pure-CSS fade/rise runs instead, with 0–300 ms delays. The resting state is fully visible, so the text shows even if the animation never runs.
- **Grain overlay replaced.** The fixed, full-viewport `feTurbulence` layer with `mix-blend-mode` is gone. It's now a static 160 px noise tile (`grain.png`, 6 KB) layered into the backgrounds of the paper surfaces. The overall paper tone is unchanged and the speckle is about 55% of its old strength. It no longer covers the header, buttons or footer.
- **Fonts are self-hosted.** Six subset WOFF2 files, 78 KB in total:
  - Cormorant Garamond 400, 400 italic, 500 and 600.
  - Jost 400 and 500.
  - Dropped: Cormorant 500 italic (unused) and Jost 300 (body moved to 400).
  - Only the two hero faces are preloaded.
  - Metric-matched fallback faces (Georgia / Noto Serif, Arial / Roboto) mean the swap causes no layout shift.
  - The Google Fonts link and preconnects were removed.
- **Looping animations pause when not visible.** Steam, float, status pulse and map ring stop when off screen (IntersectionObserver) or when the tab is hidden. `transform-box: fill-box` was added to the SVG transforms.
- **`content-visibility: auto`** on Menu, Reviews, Visit and the footer. Sizes were measured per breakpoint. In-page links and `#hash` loads switch it off first, so anchor jumps land exactly; this was tested at 8 widths from 360 to 1920 px.
- **Hero height** is now `100svh`, with `100vh` as a fallback.
- **Header**: `backdrop-filter` toggles instantly and only the colour and shadow fade. The scroll listener was replaced by an IntersectionObserver on a sentinel near the top of the page.
- **Shared SVG sprite** (`<symbol>`/`<use>`) for the logo, stars, croissant outline, pin and phone icons.
- **`Intl.DateTimeFormat` is cached** instead of being created every minute.
- **Minified production build** via `build.mjs`. The HTML is 92 KB → 66 KB, or about 17 KB gzipped.

## Aesthetic
- **Nothing reads as unfinished any more.**
  - Prices render only when `data-price` holds a value. Until then the card foot shows just the category, led by the gold rule used in the section labels.
  - The "Placeholder" badge and "TBC" are gone. While closing times are missing, the Hours box shows one line: *"Open daily from 8 a.m. — call for today's closing time"* ("call" links to the phone number). The full table appears automatically once every `data-close` is filled in.
  - The old "Full weekly hours are coming soon" note was removed, since the single line replaces it.
- **Typography**
  - Body text is now Jost 400.
  - Display headings use −0.02em tracking.
  - `text-wrap: balance` on h1–h3 and `pretty` on paragraphs.
  - Kerning and ligatures are on.
  - Prices and hours use lining tabular figures; running serif text keeps Cormorant's oldstyle figures.
  - `hanging-punctuation` on the quotes (only Safari supports it).
  - Craft copy has a 64ch measure.
- **Spacing**: added a `--space-1…9` scale and used it for section rhythm, gaps and heads. Desktop section padding went from 8rem to 9.5rem, with more room below the section titles.
- **Motion**
  - Card hover lift is now −3 px, with the art moving `rotate(-1.5deg) scale(1.015)` over 700 ms.
  - The float is 4 px.
  - Buttons no longer jump on `:active`. Solid buttons get a faint inner highlight and a hairline that draws out on hover.
- **Details**
  - Cards have a fine 6 px inset gold frame.
  - A second wheat divider sits between Reviews and Visit.
  - The ham stroke is now rouge.
  - The featured croissant is tilted, with a few loose flakes.
  - Desktop nav has a ghost-pill "Call" button.
  - The footer has a gold wheat sprig on the bottom rule and a hidden Facebook slot.
  - Selection colour is now parchment, and the gold glow behind the card art is softer.
- **Photo band** is built but disabled. It's commented-out `<picture>` markup with AVIF/WebP sources, `srcset`/`sizes`, width/height, lazy loading and a warm placeholder colour.
- **Accessibility fix**: the rating badge and logo links now include their visible text in their accessible names. This fixes the Lighthouse "label-content-name-mismatch" flag.

## SEO
- Added a canonical link, Open Graph and Twitter tags, `apple-touch-icon.png`, and `color-scheme: light`.
- Structured data now has `url`, `image` and `@id`.
- `openingHoursSpecification` is generated from the same `data-open`/`data-close` values as the table, but only once every closing time exists.
- Removed `aggregateRating`. Google ignores self-served review markup for local businesses, and it can be flagged.

## Note for the host (not implemented here)
- Enable **Brotli or gzip** for HTML.
- Serve `fonts/*.woff2`, `grain.png` and `apple-touch-icon.png` with **long cache headers**, e.g. `Cache-Control: public, max-age=31536000, immutable`.
- Keep `index.html` on `no-cache`, so changes show up straight away.

## OWNER items still needing real data
`npm run build` lists whichever of these are still open. Each one has an `OWNER:` comment at the spot in `index.html`.
1. **Live domain**: replace `https://www.lacroissanterie.example/` (canonical, OG/Twitter, structured data).
2. **Menu prices**: `data-price` on each of the 5 cards.
3. **Closing times**: `data-close` on each hours row; also mark any closed days.
4. **Share image**: a 1200 × 630 `og-image.jpg` uploaded to the live site.
5. **Facebook URL**: footer link `href`.
6. **Map coordinates**: the `geo` property in the structured data.
7. **Photography**: photos for the disabled photo band, with alt text and a caption.
