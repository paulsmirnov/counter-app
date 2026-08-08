# AGENTS.md

## Project Overview
- Zero-compilation PWA built with native ES6 JavaScript modules, HTML5, and Vanilla CSS3.
- Runs directly in browser and GitHub Pages without bundlers, node dependencies, or build pipelines.
- Multi-counter application with local storage persistence, event history undo stack, and CSV export.

## Critical Rules
- **No Build Tools / Bundlers**: Never add Webpack, Vite, npm scripts, or transpilers. All JS must remain native browser ES6 modules.
- **No Frameworks / UI Libraries**: Do not install or import React, Vue, Tailwind, etc. Maintain standard HTML/CSS/JS.
- **Centralized State**: Do not mutate counter state directly inside UI modules (`js/ui/`). All mutations must go through `store.js` actions.
- **Service Worker Cache Sync**: When adding new static files (`.css`, `.js`, assets), update the `CACHE_ASSETS` array in `sw.js`.

## Commands
- **Run all tests**: `node --test`
- **Run single test file**: `node --test js/csv.test.js`
- **Run local dev server**: `npx serve .`

## Conventions Agents Get Wrong
- **Relative `.js` Extensions**: Always include explicit `.js` extensions in ES module imports (e.g., `import { store } from './store.js'`).
- **DOM Event Binding**: Attach event listeners via JS in `js/ui/` render modules or delegation; avoid inline `onclick="..."` HTML attributes.
- **Conventional Commits**: Use change type prefixes (`feat:`, `fix:`, `docs:`, `chore:`, etc.) with imperative subject lines (50/72 line limit rule) and no scope; use "Co-authored-by: Antigravity" trailer.
- **RFC 4180 CSV Rules**: Any changes to `js/csv.js` must maintain double-quote wrapping and escaping for fields containing commas, quotes, or newlines.

## Exemplars
- **Unit Testing**: [csv.test.js](js/csv.test.js) - Native Node test runner with `node:test` and `node:assert/strict`.
- **State Store**: [store.js](js/store.js) - Observable state management with undo event stack.
- **UI Renderer**: [renderGrid.js](js/ui/renderGrid.js) - Dynamic DOM component rendering and event delegation.
