# Pantaunet v2.0.0 - Release Notes

## What's New

Milestone v2.0 focusing on High Accuracy Monitoring, Data Analytics, and Application Control.

## Features (v2.0)

- **High Accuracy Monitoring** — Uses Windows IPHLPAPI/TCP-Table filtering to ensure stats reflect actual network traffic, excluding local disk I/O.
- **Long-Term History** — Integrated SQLite database to track your network usage over days, weeks, and months.
- **Application Control** — Built-in firewall integration to block/allow internet access for specific applications with a single click.
- **Floating Desktop Widget** — Real-time speeds directly on your desktop (Always-on-top).
- **Dynamic Tray Icon** — Toggleable real-time speed display in your system tray.
- **Humorous Insights** — A personality-driven engine that provides witty feedback based on your usage patterns.

## Features (v1.0 - v1.2)

- **Backend Abstraction** — Decoupled monitoring logic for better stability.
- **Shared UI Library** — Unified components for Dashboard and Widget.
- **Centralized State** — Faster and more reliable state management using Zustand.
- **Real-Time Speed Monitoring** — View download and upload speeds in real-time.
- **Per-Application Usage** — See which applications are using your internet.
- **Usage Alerts** — Get notified when usage exceeds configurable thresholds.
- **Dark/Light Theme** — Choose between themes.
- **Persistent Settings** — Your preferences saved between sessions.
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

## Downloads

| Platform | File | Size |
|----------|------|------|
| Windows (.exe) | [Download](https://github.com/ajamj/pantaunet/releases/latest) | — |
| Windows (.msi) | [Download](https://github.com/ajamj/pantaunet/releases/latest) | — |
| Linux (.AppImage) | [Download](https://github.com/ajamj/pantaunet/releases/latest) | — |
| macOS (.dmg) | [Download](https://github.com/ajamj/pantaunet/releases/latest) | — |

## License

MIT License — see [LICENSE](LICENSE) for details.
