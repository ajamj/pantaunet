# Pantaunet - Internet Usage Monitor

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-yellow)
![Stars](https://img.shields.io/github/stars/ajamj/pantaunet)

**Pantaunet** is a cross-platform desktop application for monitoring per-application internet usage. Built with Tauri + React + TypeScript.

## Features

- **Real-Time Speed Monitoring** - View download and upload speeds in real-time with numeric display
- **Per-Application Usage** - See which applications are using your internet and how much data
- **Usage Alerts** - Get notified when usage exceeds configurable thresholds
- **Speed History** - Interactive charts showing network usage over time
- **Dark/Light Theme** - Choose between themes for comfortable monitoring
- **System Tray** - Background residence with quick access menu
- **Data Export** - Export usage data to CSV/JSON

## Screenshots

The application features a clean dashboard with:
- Download/upload speed meters
- Network speed history chart
- Top bandwidth-consuming processes
- Settings panel

## Installation

### Pre-built Binaries

Download the latest release from [GitHub Releases](https://github.com/ajamj/pantaunet/releases):

- **Windows**: `.exe` or `.msi` installer
- **Linux**: `.AppImage` or `.deb`
- **macOS**: `.dmg`

### Build from Source

#### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.70+
- [npm](https://www.npmjs.com/)

#### Build

```bash
# Clone the repository
git clone https://github.com/ajamj/pantaunet.git
cd pantaunet

# Install dependencies
npm install

# Build the application
npm run tauri build
```

The built executable will be in `src-tauri/target/release/`.

## Development

```bash
# Start development server
npm run tauri dev
```

## Tech Stack

- **Framework**: [Tauri v2](https://tauri.app/) - Rust-based desktop app framework
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State**: Zustand
- **Backend**: Rust with sysinfo crate

## Known Limitations

- **Per-process IO includes disk + network**: On Windows, per-application download/upload values include all I/O operations (disk reads/writes, network traffic, device I/O). This is because sysinfo uses Windows `GetProcessIoCounters` API. A future release will use ETW-based tracking for network-only accuracy.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).

## Related

- [Sniffnet](https://github.com/GyulyVGC/sniffnet) - Similar Rust network monitor
- [Traffic Monitor](https://github.com/zhongyang219/TrafficMonitor) - Windows network monitor

---

Made with ♥ by [ajamj](https://github.com/ajamj)