# Pantaunet v2.1.0 - Issue Resolution & Stability

## What's New

Milestone v2.1 focused on hardening the core application, improving performance, and delivering a modern high-contrast user interface.

## Key Improvements

### 🛠️ Stability & Bug Fixes
- **Draggable Widget** — Restored full dragging functionality to the desktop mini-window across all regions.
- **Tab Distinction** — Fixed a bug where Dashboard and History views were indistinguishable; implemented proper conditional rendering.
- **Backend Reliability** — Initialized the historical database at runtime and resolved race conditions in speed calculations.

### 🎨 UI/UX Enhancements
- **Academic Dark Theme** — Complete visual refactor using high-contrast "Pure Black" (#000000) and "Pure White" (#FFFFFF) palette.
- **Granular Metrics** — Process list now features separate "Total Down" and "Total Up" columns.
- **Smart Sorting** — Implemented accurate multi-column sorting using raw numeric values.
- **Optimized Layout** — Refined widget dimensions and removed unwanted scrollbars for a cleaner desktop experience.

### ⚡ Performance & Security
- **IPC Optimization** — 80x reduction in redundant backend requests by migrating data formatting to local TypeScript utilities.
- **Firewall Hardening** — Fixed executable path targeting and sanitized rule names to prevent potential command injection.
- **CI/CD Infrastructure** — Established a robust automated testing pipeline using GitHub Actions for all Pull Requests.

---

## Features (v2.0)

- **High Accuracy Monitoring** — Uses Windows IPHLPAPI/TCP-Table filtering to ensure stats reflect actual network traffic.
- **Long-Term History** — Integrated SQLite database to track network usage over days, weeks, and months.
- **Application Control** — Built-in firewall integration to block/allow internet access for specific applications.
- **Floating Desktop Widget** — Real-time speeds directly on your desktop (Always-on-top).
- **Dynamic Tray Icon** — Toggleable real-time speed display in your system tray.

---

## Installation

### Windows
1. Download the `.exe` installer from [GitHub Releases](https://github.com/ajamj/pantaunet/releases)
2. Run the installer
3. Launch Pantaunet from Start Menu or system tray

### Linux
1. Download the `.AppImage` from [GitHub Releases](https://github.com/ajamj/pantaunet/releases)
2. Make it executable: `chmod +x Pantaunet-*.AppImage`
3. Run: `./Pantaunet-*.AppImage`

### macOS
1. Download the `.dmg` from [GitHub Releases](https://github.com/ajamj/pantaunet/releases)
2. Open the DMG and drag Pantaunet to Applications

## License

MIT License — see [LICENSE](LICENSE) for details.
