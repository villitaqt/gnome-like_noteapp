# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (Tauri + Vite HMR)
npm run tauri dev

# Type-check without emitting
npx tsc --noEmit

# Build installer (.exe and .msi in src-tauri/target/release/bundle/)
npm run tauri build
```

`npm run tauri dev` launches both the Vite dev server (port 1420) and the Tauri webview. If port 1420 is already in use from a previous session, kill the process first.

## Architecture

This is a **Tauri v2 + React + TypeScript** desktop app — a minimal text editor styled after GNOME Text Editor.

### Key design decisions

**Custom titlebar** — `decorations: false` in `tauri.conf.json` removes the OS window frame. The entire titlebar (tabs, action buttons, min/max/close) is rendered in React. Window dragging uses the HTML attribute `data-tauri-drag-region` on `<div className="titlebar">` — do **not** use CSS `-webkit-app-region: drag`, which breaks button clicks in WebView2.

**Tab state** — all tab logic lives in `src/store/useTabs.ts` as a single `useReducer`. `App.tsx` owns the state and passes handlers down. Each tab has an `id`, `title`, `filePath | null`, `content`, and `isDirty` flag.

**CodeMirror** — one `EditorView` instance per tab, keyed by `tab.id` in `EditorPane`. The hook `useCodeMirror.ts` manages three `Compartment`s:
- `langCompartment` — language extension, auto-detected via `LanguageDescription.matchFilename`; falls back to Markdown with embedded code block highlighting
- `themeCompartment` — `oneDark` in dark mode, custom `lightTheme + defaultHighlightStyle` in light mode; switches live on OS color scheme change
- `lineNumsCompartment` — holds `lineNumbers() + highlightActiveLineGutter() + foldGutter()` together so all three toggle with `Ctrl+L`; hiding also sets `.no-gutter` class + CSS `display: none` on `.cm-gutters` to eliminate the border

**Session persistence** — `src/lib/session.ts` writes only the file paths of *saved* tabs to `appDataDir/session.json`. Unsaved (filePath = null) or dirty tabs are intentionally not persisted.

**Auto-save** — `Ctrl+S` on a tab with no filePath calls `nextAutoName()` from `appConfig.ts` to find the next available `note<n>.md` (or `.txt`) in the notes folder (`Documents\Text Editor\`). Extension and folder path are stored in `appDataDir/config.json`.

**"Open with" integration** — `src-tauri/src/lib.rs` reads CLI args on startup, filters for valid file paths, and emits an `"open-files"` event to the frontend after a 400ms delay. The installer registers file associations via `bundle.fileAssociations` in `tauri.conf.json`.

### Permissions

`src-tauri/capabilities/default.json` grants explicit window permissions (`allow-minimize`, `allow-toggle-maximize`, `allow-close`, `allow-start-dragging`) and scoped FS permissions. The `$DOCUMENT/**` scope covers the notes folder.

### Styling

CSS lives in `src/styles/`. Adwaita light/dark variables are in `global.css` (`:root` + `@media (prefers-color-scheme: dark)`). No CSS framework — plain CSS variables throughout.
