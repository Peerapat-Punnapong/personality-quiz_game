# MERUMAO (เมรุเมา) — Thai Ghost Personality Quiz

Built from `MERUMAO_prompt_v2.md`. React 19 + TypeScript, bundled with esbuild. Plain CSS (design tokens in `src/styles.css`), CSS / Web-Animation motion, tiny hash router.

## Run
```bash
npm install
npm run build        # → dist/ (static site, deploy anywhere: Netlify, Vercel, GitHub Pages)
npx serve dist       # open http://localhost:3000
npm test             # scoring tests (balance, determinism, distribution over all 4^10 answers)
node tests/flow.mjs  # end-to-end (needs `npx serve dist -l 8765` running): flow, back/refresh, no-stretch, overflow, share, reduced-motion
npm run assets       # re-run the asset pipeline from the original Thai-named files (python3 + Pillow + OpenCV)
```

## Routes (hash names, work on any static host)
`#home` · `#lore` · `#intro-1…6` · `#ready` · `#quiz-1…10` · `#reveal` · `#result-pob|dib|tani|am|kongkoi|takien|krasue|pret`

## Structure
- `src/data/` — `quiz.ts` (10 questions × 4 cards, verbatim), `intro.ts`, `ghosts.ts`, `scoring.ts` (+2 / +1 table, tie-break)
- `src/pages/` — Home, Lore, Intro, Ready, Quiz, Reveal (cinematic video + web fallback), Result
- `src/components/` — Nav, GhostModal, Veil (page transitions), ui (Img, FlameTitle, Particles, Smoke, SceneBg, tilt, scroll reveal)
- `scripts/build_assets.py`, `scripts/extract.py` — asset pipeline; `public/assets/manifest.json` lists every asset with source + size + whether it is original / upscaled / extracted
- `ASSET_REQUESTS.md` — images that still need a proper high-res version

## Deviations from the prompt (sandbox had no npm registry access)
- esbuild instead of Vite, CSS/WAAPI animation instead of Framer Motion, own hash router instead of react-router, node:test instead of Vitest. Behaviour is the same; swapping in those libs later is optional.
- Ghost/card/scene upscaling used Lanczos + unsharp (no AI upscaler available offline) — see ASSET_REQUESTS.md.
