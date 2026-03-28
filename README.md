# Color by Number

A client-side color-by-number puzzle web app built with Nuxt 3. Upload any image, convert it into a numbered puzzle, and play it in the browser — no server required.

## Features

### Image → Puzzle Conversion
All processing runs client-side in pure TypeScript:
- **K-Means color quantization** in CIELAB color space with K-Means++ initialization
- **Connected-component labeling** via union-find to detect regions
- **Small region merging** into neighboring regions based on shared border length
- **Marching squares** contour extraction with Douglas-Peucker simplification
- **Pole-of-inaccessibility** label placement so numbers sit inside regions

Users can tune conversion parameters: number of colors, minimum region size, max resolution, blur strength, and contour detail.

### Interactive Puzzle Player
- Click regions with the selected color to fill them
- **Concurrent fill animations** — multiple regions animate simultaneously without cancelling each other
- **Zoom & pan** via scroll wheel, pinch, and drag
- Custom crosshair cursor for precise clicking
- Color palette with remaining-region badges and completed-color dimming

### Completion & Reveal
- Original image overlays the puzzle on completion with a toggle in the toolbar
- Celebration overlay with animated stars and a cross-fade to the original image
- Already-completed puzzles show the overlay on load

### Persistence
- Puzzles saved to **IndexedDB** via `idb` — works fully offline
- Progress tracked per-region and persisted on every fill
- Gallery page with thumbnails, progress bars, and delete support

### Dark Mode
- Light/dark toggle in the nav bar
- Persisted to `localStorage`, respects `prefers-color-scheme` on first visit
- Full theme system via CSS custom properties

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 3 (SPA mode, static generation) |
| UI | PrimeVue 4 (Aura theme) |
| Icons | Nuxt Icon (Iconify MDI set) |
| Fonts | Inter + Fira Mono via @nuxt/fonts |
| State | Pinia |
| Persistence | IndexedDB via `idb` |
| Image Processing | Canvas API + custom TypeScript engine |
| Rendering | Canvas 2D with Web Worker offloading |

## Project Structure

```
app/
├── assets/css/main.css          # Theme system + global styles
├── components/
│   ├── config/ConversionConfig  # Conversion parameter sliders
│   ├── gallery/PuzzleCard       # Thumbnail card for puzzle grid
│   ├── puzzle/
│   │   ├── ColorPalette         # Numbered color swatches
│   │   ├── PuzzleCanvas         # Main interactive canvas
│   │   ├── PuzzleToolbar        # Zoom, progress, reset, overlay toggle
│   │   └── RevealOverlay        # Completion celebration
│   └── upload/ImageUploader     # Drag-and-drop file picker
├── composables/
│   ├── useDB.ts                 # IndexedDB CRUD
│   ├── useImageProcessor.ts     # Conversion pipeline orchestrator
│   ├── usePuzzleStore.ts        # Pinia store for puzzle state
│   └── useTheme.ts              # Dark mode toggle
├── lib/
│   ├── quantize.ts              # K-Means in CIELAB
│   ├── regionize.ts             # Connected-component labeling
│   ├── contour.ts               # Marching squares
│   ├── simplify.ts              # Douglas-Peucker simplification
│   ├── labelPlace.ts            # Region label positioning
│   ├── imageUtils.ts            # Blur, downscale, thumbnails
│   └── types.ts                 # Shared TypeScript interfaces
└── pages/
    ├── index.vue                # Upload + configure + convert
    ├── my-puzzles.vue           # Saved puzzles gallery
    └── play/[id].vue            # Puzzle player
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server at localhost:3000
npm run dev

# Generate static build
npx nuxi generate
# Output in .output/public/
```

## Deployment

The app is a static SPA. Deploy the `.output/public/` directory to any static host:

**Cloudflare Pages:**
- Build command: `npx nuxi generate`
- Output directory: `.output/public`

**Netlify / Vercel / GitHub Pages:** same output directory, any static hosting works.

## Conversion Pipeline

1. **Preprocess** — Load image, downscale to max resolution, optional Gaussian blur
2. **Quantize** — K-Means clustering in CIELAB to reduce to N colors
3. **Regionize** — Connected-component labeling to identify contiguous regions
4. **Merge** — Absorb regions below minimum size into their largest neighbor
5. **Contour** — Marching squares boundary extraction + Douglas-Peucker simplification
6. **Label** — Pole-of-inaccessibility placement for region numbers
7. **Build** — Assemble `PuzzleData` with palette, regions, contours, and metadata

## Performance

- Images downscaled before processing (configurable, default 800px)
- Fill bitmap construction offloaded to a Web Worker
- Canvas redraws use cached `ImageBitmap` layers — only affected regions re-render
- Fill animations use per-region `requestAnimationFrame` loops with pixel-perfect mask bitmaps
- Completed animation overlays persist until the worker delivers the updated bitmap (no flicker)

## License

MIT
