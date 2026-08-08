# Technical Architecture Specification: Counter App (PWA)

## 1. Executive Summary & Tech Stack Overview

The **Counter App** is built using **Modern Vanilla JavaScript (ES6+ Native Modules)**, **HTML5**, and **Vanilla CSS3**. It operates as a zero-compilation Single Page Application (SPA) designed to deploy directly to GitHub Pages without bundlers, node dependencies, or build pipelines.

### Core Stack Rationale:
- **Language & Runtime**: Native ES6+ JavaScript (`<script type="module">`). Leverages modern browser capabilities natively supported on Android / Pixel 10 Chrome.
- **Zero Build / Zero Compilation**: No Webpack, Vite, or npm build step required. Source code is served directly by GitHub Pages for zero setup friction, instant deployment, and zero long-term dependency maintenance rot.
- **Styling Engine**: Modern Vanilla CSS3 utilizing CSS Custom Properties (Design Tokens), Flexbox, CSS Grid (`minmax`), and GPU-accelerated CSS animations.
- **Storage Layer**: Synced client-side state using `localStorage` API with structured JSON serialization and event-history logging for instant offline persistence.
- **PWA Infrastructure**: Web App Manifest (`manifest.json`) for Android home-screen installation and a lightweight Service Worker (`sw.js`) for full offline availability.

---

## 2. Directory & Module Architecture

```
c:\Projects\counter-app\
├── index.html                  # Single Page Application HTML Shell
├── manifest.json               # PWA Web App Manifest (Icons, theme color, display: standalone)
├── sw.js                       # Service Worker for offline asset caching
├── styles/
│   ├── main.css                # Global CSS variables, reset, typography, & animations
│   ├── grid.css                # Responsive 2/3-column grid layout & tile styles
│   └── components.css          # Modals, Action Sheets, Header bar, & Toast UI
├── js/
│   ├── app.js                  # Application entry point, routing & global event dispatcher
│   ├── store.js                # Centralized state management & event history stack (Undo)
│   ├── storage.js              # Persistence wrapper for localStorage (JSON serialize/deserialize)
│   ├── csv.js                  # CSV report generator & navigator.share integration
│   ├── haptics.js              # Touch feedback & navigator.vibrate wrapper
│   └── ui/
│       ├── renderHub.js        # Projects Hub screen renderer (Screen A)
│       ├── renderGrid.js       # Counter Grid screen renderer (Screen B)
│       ├── renderModal.js      # New Project / New Counter modal renderers
│       └── renderSheet.js      # Counter contextual Action Sheet renderer
└── docs/
    └── plan/
        ├── 00-initial-ideas.md
        ├── 01-refined-design.md
        └── 02-technical-architecture.md
```

---

## 3. State Management & Undo Data Architecture

To ensure high performance without framework overhead, state management uses an **Observable Pub/Sub Store** combined with an append-only **Event History Stack**.

```
 +------------------+            +-------------------+            +---------------------+
 |   User Touch /   | ---------> |    Store Action   | ---------> |  Append Event to    |
 |  Tile Increment  |            |  (store.tap(id))  |            |  project.events     |
 +------------------+            +-------------------+            +---------------------+
                                                                             |
                                                                             v
 +------------------+            +-------------------+            +---------------------+
 |   UI Re-render   | <--------- | Notify Subscribers| <--------- |  Update Storage &   |
 |  (Targeted DOM)  |            | (store.subscribe) |            |  Sync localStorage  |
 +------------------+            +-------------------+            +---------------------+
```

### State Store Interface & Responsibilities (`js/store.js`):
- **Core State Store**: Maintains in-memory reactive state (`activeProjectId`, `sortMode`, `projects` collection).
- **Event Stack for Undo**: Appends an immutable event object (`{ id, counterId, timestamp, delta }`) to the active project's `events` array upon every tap.
- **Undo Operation**: Pops the top event from `events`, decrements the corresponding counter by `delta`, and triggers storage sync.
- **Subscriber Pattern**: Exposes a `subscribe(listener)` method allowing UI renderers to reactively update on state mutations.

---

## 4. UI Rendering Engine & Targeted DOM Updates

Instead of re-rendering the entire DOM tree on every tap, the app employs **Targeted Element Updates** for sub-millisecond tap response:

1. **Full View Switch**: When switching between Projects Hub and Counter Grid, the container innerHTML is rendered.
2. **Active Tap Response**: Single-tap on a tile updates *only* that specific tile's numeric count element in the DOM and triggers the haptic feedback utility.
3. **Sort Execution**: Re-ordering tiles occurs only when the sort dropdown/toggle is explicitly clicked, animating tile positions via CSS Grid transitions.

---

## 5. CSV Export & Native Android Sharing Strategy

### 1. CSV Generator Contract (`js/csv.js`)
- Formats active project counters into a standard 2-column CSV payload with headers `Category Title,Total Count`.
- Escapes special characters (commas, double quotes, line breaks) to guarantee standard RFC 4180 CSV compliance.

### 2. Native Share Protocol (`navigator.share`)
- Wraps the formatted CSV text into an in-memory `File` blob (`text/csv`).
- Evaluates `navigator.canShare({ files: [file] })` to open native Android Share Intent (Google Drive, Gmail, Files).
- Provides fallback to trigger an automatic blob URL download (`<a>` download attribute) if native sharing is unavailable.

---

## 6. PWA Offline Caching & Deployment Pipeline

### Service Worker Lifecycle Strategy (`sw.js`)
- **Strategy**: Cache-First for static app assets, falling back to network fetch.
- **Scope**: Intercepts app asset fetches (`index.html`, stylesheet design tokens, JavaScript modules, manifest, and icons).
- **Offline Reliability**: Pre-caches app shell on Service Worker `install` event to guarantee full offline capability on Pixel 10 without cellular data.

### GitHub Pages Deployment Pipeline
- **Deployment Source**: Direct deployment from the `main` branch.
- **Zero-Build Workflow**: Commit updates to `main` branch; GitHub Pages immediately serves the static assets without compiling.

---

## 7. Implementation Milestones

1. **Step 1: Project Skeleton & PWA Manifest** (`index.html`, `manifest.json`, `styles/main.css`, `sw.js`).
2. **Step 2: Core Store & Persistence Engine** (`js/store.js`, `js/storage.js`, `js/haptics.js`).
3. **Step 3: UI Component Renderers** (`js/ui/renderHub.js`, `js/ui/renderGrid.js`, `js/ui/renderModal.js`, `js/ui/renderSheet.js`).
4. **Step 4: CSV Export & Native Share** (`js/csv.js`).
5. **Step 5: End-to-End Mobile Testing & PWA Verification**.
