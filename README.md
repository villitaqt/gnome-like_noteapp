# GNOME Text Editor

A minimal desktop text editor styled after [GNOME Text Editor](https://apps.gnome.org/TextEditor/), built with Tauri v2, React, and TypeScript.

![screenshot placeholder](app-icon.svg)

## Features

- Tab-based editing with session restore
- Syntax highlighting via CodeMirror (auto-detected from file extension)
- Auto-save to a configurable notes folder
- Light / dark theme following the OS color scheme
- Custom frameless titlebar with Windows-style controls
- "Open with" file association support

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18 or later | https://nodejs.org |
| Rust | stable | https://rustup.rs |
| Tauri CLI | included via npm | — |

> On Windows, Rust also requires the [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) or Visual Studio with the "Desktop development with C++" workload.

## Getting started

```bash
# 1. Clone the repo
git clone <repo-url>
cd gnome-editor

# 2. Install JavaScript dependencies
npm install

# 3. Start the dev server (Tauri + Vite HMR)
npm run tauri dev
```

The app window will open automatically. The Vite dev server runs on port 1420. If it's already in use from a previous session, kill the process first.

## Build

```bash
# Produces installers in src-tauri/target/release/bundle/
npm run tauri build
```

On Windows this generates both an `.msi` (WiX) and an `.exe` (NSIS) installer.

## Project structure

```
src/                    React + TypeScript frontend
  components/
    Editor/             CodeMirror editor pane
    Titlebar/           Custom titlebar, tabs, window controls
  lib/                  File I/O, session persistence, config
  store/                Tab state (useReducer)
  styles/               Plain CSS with Adwaita variables
src-tauri/
  src/                  Rust backend (Tauri entry point)
  capabilities/         Permission declarations
  icons/                App icons for all platforms
```

## Type checking

```bash
npx tsc --noEmit
```
