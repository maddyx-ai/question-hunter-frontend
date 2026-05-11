# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**question-hunter** — a marketing/landing site built with Astro 6, React 19, and Tailwind CSS v4. Currently in early scaffolding phase.

## Commands

```bash
npm run dev        # Start dev server (localhost:4321)
npm run build      # Production build → ./dist/
npm run preview    # Preview production build locally
npm run astro ...  # Run Astro CLI commands (add, check, etc.)
```

Package manager: **npm** (not pnpm — this project has no workspace setup).

## Architecture

- **Framework**: Astro 6 in SSG mode (static site generation, no SSR adapter)
- **React integration**: `@astrojs/react` — React components can be used inside `.astro` pages via island architecture
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin (not PostCSS). Entry point is `src/styles/global.css` with `@import "tailwindcss"`
- **Fonts**: `@fontsource/geist-sans` and `@fontsource/jetbrains-mono` (loaded as npm packages, not Google Fonts)
- **Icons**: `lucide-react` — use React icon components, not SVG sprites
- **TypeScript**: Strict mode via `astro/tsconfigs/strict`, JSX set to `react-jsx`

### Key files

- `astro.config.mjs` — Vite plugins (tailwindcss) + integrations (react)
- `DESIGN.md` — Complete design system spec (Supabase-inspired). All color tokens, typography scale, spacing, components, and brand rules are defined here. **Follow this file for any UI work.**
- `src/pages/` — Astro file-based routing
- `src/styles/global.css` — Tailwind entry point

### React in Astro

React components render as islands — they're interactive but don't hydrate unless they have client directives (`client:load`, `client:visible`, etc.). Static content should stay in `.astro` files for zero-JS output.

## Design System Rules (from DESIGN.md)

- **Primary color**: `#3ecf8e` (emerald green) — use sparingly, only for CTAs and accents
- **Button text on green**: near-black `#171717`, NOT white
- **Button radius**: 6px (`rounded-sm`), never pill-shaped
- **Display typography**: weight 500 with negative letter-spacing
- **Canvas**: white `#ffffff` — no atmospheric gradients on hero sections
- **Dark surfaces**: `#1c1c1c` for code blocks and featured pricing tiers
- **Font**: Geist Sans as the display/body font (closest open-source alternative to Circular). System mono for code.
- **One filled green button per viewport** — emerald is scarce by design

## Node Version

Requires Node >= 22.12.0.
