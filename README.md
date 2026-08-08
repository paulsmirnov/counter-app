# Multi-Counter PWA

A lightweight, zero-compilation Progressive Web App (PWA) for fast mobile tallying, multi-project counter organization, and CSV data export. Built using native ES6 JavaScript modules, HTML5, and Vanilla CSS3 — zero bundlers, build steps, or external dependencies required.

## Features

- **Multi-Project Management**: Organize counters into separate projects (e.g. traffic surveys, inventory audits, event headcount).
- **Fast Tallying & Haptics**: Large touch targets with tactile vibration feedback (`navigator.vibrate`) on mobile devices.
- **Undo History Stack**: Multi-level undo to safely revert accidental taps.
- **Offline PWA Support**: Service Worker caching (`sw.js`) and Web App Manifest (`manifest.json`) for offline use and home-screen installation.
- **CSV Data Export**: Export tallies into RFC 4180-compliant CSV format with native Web Share API (`navigator.share`) support.
- **Zero Build Friction**: Runs directly in any modern browser and deploys seamlessly to GitHub Pages without compilation.

## Getting Started

### Run Locally

Serve the repository root directory with any static HTTP server:

```bash
npx serve .
```

Or using Python:

```bash
python -m http.server 8000
```

Open `http://localhost:3000` (or `http://localhost:8000`) in your browser.

### Run Tests

Unit tests use Node's native test runner (`node:test`):

```bash
# Run all unit tests
node --test

# Run a single test file
node --test js/csv.test.js
```

## Tech Stack

- **Frontend**: Native ES6 Modules, HTML5, Vanilla CSS3 (CSS Grid & Custom Properties)
- **State & Storage**: Observable state store (`js/store.js`) backed by browser `localStorage`
- **PWA & Cache**: Cache-First Service Worker (`sw.js`)
- **Testing**: Native Node.js test runner (`node:test` & `node:assert/strict`)

## License

[MIT](LICENSE)
