# Limra — Static HTML Template

Plain HTML/CSS export of the Limra Courses site. Drop this folder into any
tool (Google AI Studio, v0, Framer, Webflow import, etc.) to reuse the
exact design.

## Files

- `index.html` — homepage with all sections (hero, ayats, courses, trainers, testimonials, about, apply)
- `courses.html`, `trainers.html`, `about.html`, `contact.html` — individual pages
- `css/styles.css` — design tokens (OKLCH palette), `.soft-card`, `.glow-btn`, marquee animation
- `assets/` — hero & course images (jpg)

## Stack used in the template

- **Tailwind CSS** via Play CDN (`https://cdn.tailwindcss.com`) with the same color tokens as the live app mapped to CSS variables.
- **Google Fonts**: Playfair Display (headings) + Nunito (body).
- Inline SVG icons (Material `AutoAwesomeRounded` replaced with an equivalent sparkle SVG; lucide icons inlined).
- No JavaScript framework — a tiny script toggles the mobile menu.

## Run locally

```bash
cd limra-template
python3 -m http.server 8000
# open http://localhost:8000
```

## Customise

Colors live in `css/styles.css` under `:root` as OKLCH variables
(`--primary`, `--background`, `--pink-soft`, etc.). Change one variable
and every Tailwind utility that references it updates automatically.

The `Apply` form is a static placeholder — wire its `onsubmit` to your
backend or form service.