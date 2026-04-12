# Pantaunet - Project Context

## Project Overview

**Pantaunet** is a cross-platform desktop application for monitoring per-application internet usage. Built with **Tauri v2** (Rust backend) + **React 18** + **TypeScript** + **Tailwind CSS v4**.

### Key Features
- Real-time download/upload speed monitoring
- Per-application network usage tracking
- Speed history with interactive charts (Recharts)
- Usage alerts with configurable thresholds
- Dark/Light theme toggle
- System tray with quick access menu
- Data export to CSV/JSON (planned)

### Architecture
- **Backend (Rust)**: `src-tauri/src/` - Uses `sysinfo` crate to collect network stats and process information
- **Frontend (React)**: `src/` - Dashboard UI with Tailwind CSS styling
- **Communication**: Tauri commands (`invoke`) bridge frontend and backend

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Tauri v2 |
| Frontend | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| i18n | react-i18next |
| State | Zustand |
| Backend | Rust (sysinfo, tokio, chrono) |
| Icons | Lucide React |

## Directory Structure

```
pantaunet/
├── src/                    # React frontend
│   ├── App.tsx             # Main application component
│   ├── App.css             # App-specific styles
│   ├── index.css           # Tailwind theme configuration
│   ├── main.tsx            # Entry point
│   └── assets/             # Static assets
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── lib.rs          # Main Rust library + Tauri setup
│   │   ├── main.rs         # Binary entry point
│   │   └── network.rs      # Network stats utilities
│   ├── tauri.conf.json     # Tauri app configuration
│   ├── Cargo.toml          # Rust dependencies
│   └── icons/              # App icons
├── .planning/              # GSD workflow files
│   └── debug/              # Debug session logs
├── docs/                   # Documentation
├── public/                 # Public static files
└── dist/                   # Build output
```

## Building and Running

### Prerequisites
- Node.js 18+
- Rust 1.70+
- npm

### Commands

```bash
# Install dependencies
npm install

# Development mode (starts Vite + Tauri)
npm run tauri dev

# Build for production
npm run tauri build

# Frontend-only dev server
npm run dev

# Build frontend only
npm run build

# Preview built frontend
npm run preview
```

### Build Outputs
Production builds are placed in `src-tauri/target/release/`. Platform-specific installers:
- Windows: `.exe`, `.msi`
- Linux: `.AppImage`, `.deb`
- macOS: `.dmg`

## Development Conventions

### TypeScript
- Strict mode enabled (`strict: true`)
- `noUnusedLocals` and `noUnusedParameters` enforced
- ES2020 target with React JSX

### Rust
- Edition 2021
- Release profile: strip symbols, LTO enabled, single codegen unit
- Async runtime: Tokio (sync, time, rt features)

### Styling
- Tailwind CSS v4 with CSS-based configuration (`@theme` directive)
- Dark mode: class-based via `@custom-variant dark (&:where(.dark, .dark *))`
- Custom variant added to `src/index.css` to enable `.dark` class toggling

### Tauri Commands
The following commands are exposed from Rust to the frontend:
- `get_network_usage` - Returns current network stats and top processes
- `format_bytes_command` - Formats bytes to human-readable string
- `format_speed_command` - Formats bytes/sec to human-readable string
- `get_system_info` - Returns OS, hostname, CPU count, memory info

## Tauri Configuration

- Window: 900x650, resizable, centered, with decorations
- System tray: enabled with Show/Hide/Toggle Speed/Quit menu
- Dev server: port 1420 (strict)
- Frontend dist: `../dist`

## Known Patterns

### Dark Mode
Dark mode is toggled via React state (`darkMode`) in `App.tsx`. The `.dark` class is applied to the root div. Tailwind v4 custom variant in `index.css` enables `dark:` utility variants.

### Event Listening
The app uses Tauri events (`listen`) for tray-initiated actions like toggling speed display.

### Polling
Network stats are polled every 1 second via `setInterval` with `invoke("get_network_usage")`.

### State Management
Currently uses React `useState`. Zustand is available for more complex state needs.

## External Tools & Workflows

This project uses the **GSD (Get Shit Done)** workflow via `.planning/` directory for:
- Debug sessions (`.planning/debug/`)
- Project state tracking
- Planning and documentation

Quality gates and design reviews are enforced via metaswarm superpowers.
