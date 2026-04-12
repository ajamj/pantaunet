# Pantaunet v1.0.0 - Release Notes

## What's New

First release of Pantaunet — a cross-platform desktop application for monitoring per-application internet usage.

## Features

- **Real-Time Speed Monitoring** — View download and upload speeds in real-time
- **Per-Application Usage** — See which applications are using your internet
- **Usage Alerts** — Get notified when usage exceeds configurable thresholds
- **Speed History** — Interactive charts showing network usage over time
- **Dark/Light Theme** — Choose between themes for comfortable monitoring
- **System Tray** — Background residence with quick access menu and theme toggle
- **Persistent Settings** — Your preferences saved between sessions
- **Configurable Update Interval** — Choose refresh rate from 500ms to 10s

## Known Limitations

- **Per-process IO includes disk + network**: On Windows, per-application download/upload values include all I/O operations (disk reads/writes, network traffic, device I/O). This is because sysinfo uses Windows GetProcessIoCounters API. A future release will use ETW-based tracking for network-only accuracy.

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
