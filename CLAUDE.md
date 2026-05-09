# GTA Cars Podgorica — project knowledge

Static HTML/CSS/JS marketing site for **GTA Cars Podgorica**, a used-car dealership in Montenegro. Single-tenant, no build step, no server needed — open `index.html` directly in a browser and it works.

Site is in **Serbian (Latin Montenegrin)** — `lang="sr-Latn-ME"`. The dealer's customers are Montenegrin; UI text stays in Serbian even though data keys are in English.

## File layout

```
gta-cars/
├── index.html              homepage: hero, stats, 6 featured cards, about, contact
├── vozila.html             full listing (all cars)
├── auto.html               detail page — reads ?id=N from URL
├── cars.js                 data: window.CARS = [ {...}, {...} ]
├── app.js                  rendering, gallery carousel, lightbox
├── style.css               single stylesheet for everything
├── logo.jpeg               brand image (1600×1600, used in header/footer)
└── images/cars/<slug>/     per-car photo folders, files named 1.jpg…N.jpg
```

**Why no `cars.json` / no fetch?** Tried it, scrapped it. `fetch('cars.json')` is blocked under `file://` (CORS), which forced the user to run a local HTTP server just to see their own page. Loading via `<script src="cars.js">` puts the data in `window.CARS` synchronously — no server, no async, no cache. Don't reintroduce fetch unless the site moves behind a real HTTP host.

## Data schema (`cars.js`)

```js
window.CARS = [
  {
    "id": 1,                          // numeric, used in auto.html?id=1
    "slug": "audi-s3-sportback",      // also matches images/cars/<slug>/ folder name
    "name": "Audi S3 Sportback",
    "year": 2018,                     // number
    "km": 190000,                     // number
    "transmission": "Automatik",      // Serbian display string: Automatik | Manuelni
    "fuel": "Benzin",                 // Serbian: Benzin | Dizel | Hibrid | Električno
    "price": 38000,                   // number, OR null → renders "Po dogovoru"
    "sold": false,                    // true → PRODATO badge + dimmed card + struck price
    "badge": "TOP",                   // optional: "TOP" | "NOVO" — sold overrides
    "headImage": "images/cars/audi-s3-sportback/6.jpg",  // card thumbnail + first slide
    "images": [                       // gallery extras (head NOT repeated here)
      "images/cars/audi-s3-sportback/1.jpg",
      "images/cars/audi-s3-sportback/2.jpg",
      ...
    ],
    "description": "...",             // Serbian prose, 1–4 sentences
    "specs": {                        // English keys, Serbian values
      "engine": "2.0 TFSI",
      "power": "310 KS / 228 kW",
      "displacement": "1984 ccm",
      "drive": "Quattro (AWD)",       // free-form Serbian/English label
      "body": "Hatchback",            // Hatchback | Limuzina | Karavan | Coupe | SUV
      "color": "—",                   // "—" if unknown
      "doors": 5,                     // number
      "seats": 5                      // number
    },
    "features": [                     // Serbian strings, arbitrary length
      "Bang & Olufsen sistem ozvučenja",
      ...
    ]
  }
]
```

**Detail-page gallery** = `[headImage, ...images]`. Don't duplicate the head photo in `images[]`.

**Spec keys are English in JSON, Serbian in UI.** The translation map lives in `app.js`:

```js
const SPEC_LABELS = {
  engine: 'Motor', power: 'Snaga', displacement: 'Zapremina',
  drive: 'Pogon', body: 'Karoserija', color: 'Boja',
  doors: 'Vrata', seats: 'Sjedišta',
};
```

If you add a new spec key, add a label too or it'll render lowercase-English on the page.

## How-to recipes

### Add a car
1. Pick a slug (`bmw-m4-comp`, etc.). Make folder: `images/cars/<slug>/`.
2. Drop photos in. Rename to `1.jpg…N.jpg` (the helper Python script in conversation history sorts iOS-style "PHOTO-… N.jpg" filenames correctly — reuse it for batches).
3. Append a new car object to `window.CARS` in `cars.js`. Set `headImage` to the cover photo (often `1.jpg`, but doesn't have to be — pick the best shot). List remaining files in `images[]`, **excluding** whichever file is the head.
4. `id` should be unique. Convention is sequential, but no enforcement.

### Mark a car as sold
Flip `"sold": false` → `"sold": true` in `cars.js`. Card gets dimmed + strike-through price + PRODATO badge (overrides any TOP/NOVO).

### Change which photo is the cover
Re-point `headImage` to whichever `N.jpg` you want, and make sure that same path is **removed** from `images[]` (otherwise it shows twice in the gallery). Don't rename files unless you want to.

### Add / remove gallery photos
Edit the `images[]` array. Files must exist on disk at the listed paths. If you add `images/cars/foo/15.jpg` to the array but the file isn't there, you get a broken image icon in the lightbox.

### Update contact info
Phone and email are referenced in **two places**: the Contact section in `index.html` (display, `tel:`, `mailto:`, `wa.me/`, `viber://`) and the Pozovi/WhatsApp buttons rendered by `app.js` on every detail page. Search for the digits/email and replace everywhere.

Current values:
- Phone: `+382 67 388 688` (display) / `38267388688` (links)
- Email: `gtacarspg@gmail.com`
- Address: `Bulevar Pera Ćetkovića 49, 81000 Podgorica`
- Instagram: `@_gta_cars_pg_`

The Google Maps embed URL also encodes the address — update both if the location changes.

## Design system

**Palette** (matches the logo — Vice City vibe):
- `--gold: #f5c843` — primary accent (was `--cyan` in earlier commits, renamed)
- `--rust: #e0392b` — secondary accent / NOVO badge / sold indicator
- `--chrome: #d6d6da` — silver from logo
- `--bg: #0a0a0c` — page background (near-black, matches logo's pure-black canvas via `mix-blend-mode: lighten` on the logo img)

**Typography**: `Rajdhani` for headings/UI chrome, `Inter` for body. Both loaded from Google Fonts.

**Logo trick**: `.brand-logo` has `mix-blend-mode: lighten` so the JPEG's solid-black canvas dissolves into the page's `#0a0a0c` bg invisibly. No PNG conversion needed.

**Layout breakpoints**:
- `> 1024px`: desktop. Detail page = 1.5fr / 1fr two-column with sticky aside.
- `≤ 1024px`: aside collapses to static (full-width below gallery), grid stacks.
- `≤ 720px`: nav wraps, stats go to 3 cols, car grid to 1 col.
- `≤ 420px`: tightest button/badge sizing.

## Behavior notes

**Card click**: stretched-link pattern. The whole `<article class="car">` is clickable via the inner `<a class="car-link">` with the badge as a sibling (badge has `pointer-events: none` so clicks pass through to the card link).

**Detail aside is intentionally compact** (~250px tall) so it always fits the viewport when sticky. Earlier version overflowed on shorter desktop viewports — fixed by reducing padding, h1, price font sizes, button padding. The `max-height: calc(100vh - 104px) + overflow-y: auto` is a defensive fallback.

**Gallery**:
- Inline carousel in `.gal-stage` with prev/next arrows, keyboard ←/→, swipe.
- Click main image → opens fullscreen **lightbox** (z-index 1000). Same nav controls, plus close button, click-backdrop-to-close, ESC to close. Body scroll is locked while lightbox is open.
- Both stay in sync — closing the lightbox keeps the inline gallery on whatever slide you ended on.

**404**: `auto.html?id=999` (or any unknown id) shows a "Vozilo nije pronađeno" panel with a link back to `vozila.html`. Don't break this.

## Things that look weird but are intentional

- `// 06 vozila` kicker text is a stylistic section number, not a count. Don't auto-update it when car count changes.
- `200+` "Prodatih vozila" stat is a marketing claim; not derived from `cars.length`.
- Spec key `color` is `"—"` for cars where the dealer didn't provide it — keeps the 8-spec layout symmetric (2-col grid pairs evenly).
- `transmission: "Manuelni"` on the Ford Fiesta was a guess (1.6 TDCi 70 kW from 2013 was overwhelmingly manual) — confirm with the dealer if it matters.
- Footer brand is now an `<a>` linking to home (was a `<div>` originally). Both header and footer brands intentionally use the same `.brand` class with `.brand-sm` modifier on the footer for the smaller size.

## What we tried and dropped

- **`cars.json` + `fetch`** — see "Why no fetch" above. Don't bring it back.
- **Pulling Instagram posts via WebFetch** — IG returns ~empty HTML to unauthenticated requests; only the `og:image` cover (640×640) is exposed. Caption is `"caption":null`. Carousel images are inaccessible. The "Download Your Information" export from IG itself is the only viable bulk-import path. Don't waste cycles re-trying scrapers.
- **20 mock cars (BMW M4, RS6, Porsche 911, etc.)** — replaced with the real 3 (Audi S3, Audi SQ5, Ford Fiesta) once the dealer sent inventory. The mock data approach is documented above if you ever need to seed before real data is ready.

## Quick render check

To verify changes without opening a browser:

```bash
node --check cars.js && node --check app.js     # syntax
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-sandbox --virtual-time-budget=4000 \
  --dump-dom "file:///Users/lukamugosa/work/gta-cars/index.html" 2>/dev/null \
  | grep -oE '<h3>[^<]+</h3>'                   # confirm car names render
```

Headless Chrome executes the JS so this catches `cars.js` data errors that pure HTML parsing misses.
